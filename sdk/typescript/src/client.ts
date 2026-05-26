import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Configuration options for the FinancialAgent client.
 */
export interface FinancialAgentOptions {
  /**
   * API key for authentication. If not provided, will check
   * FINANCIAL_AGENT_API_KEY environment variable.
   */
  apiKey?: string;

  /**
   * Base URL of the API server.
   * @default "http://localhost:8000"
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts for failed requests.
   * @default 3
   */
  maxRetries?: number;
}

/**
 * Event types for financial agent events.
 */
export type FinancialAgentEventType =
  | 'status'
  | 'progress'
  | 'result'
  | 'error'
  | 'warning'
  | 'info';

/**
 * Base event interface for financial agent events.
 */
export interface FinancialAgentEvent {
  /** Type of event */
  type: FinancialAgentEventType;
  /** Event-specific data */
  data: Record<string, any>;
  /** Timestamp of when the event was generated */
  timestamp?: string;
}

/**
 * Result from running a skill.
 */
export interface SkillRunResult {
  /** Unique identifier for the run */
  runId: string;
  /** Status of the execution (success, error, etc.) */
  status: string;
  /** Validation results */
  validation?: Record<string, any> | null;
  /** Synthesized results from the skill */
  synthesis?: Record<string, any> | null;
  /** List of tools used in the execution */
  tools: string[];
  /** Total execution time in milliseconds */
  executionTimeMs?: number;
}

/**
 * Main client for interacting with the Financial Agent Infrastructure Platform.
 */
export class FinancialAgent {
  private readonly client: AxiosInstance;
  private readonly baseURL: string;
  private readonly apiKey: string | undefined;
  private readonly timeout: number;
  private readonly maxRetries: number;

  /**
   * Initialize the FinancialAgent client.
   *
   * @param options - Configuration options
   *
   * @example
   * ```typescript
   * const agent = new FinancialAgent({
   *   apiKey: 'your-api-key',
   *   baseURL: 'http://localhost:8000'
   * });
   * ```
   */
  constructor(options: FinancialAgentOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.FINANCIAL_AGENT_API_KEY;
    this.baseURL = options.baseURL ?? 'http://localhost:8000';
    this.timeout = options.timeout ?? 30000;
    this.maxRetries = options.maxRetries ?? 3;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.getHeaders(),
    });

    // Add request interceptor for retry logic
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add retry count to config
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['x-retry-count'] = '0';
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const { config, response } = error;
        const retryCount = parseInt(config.headers?['x-retry-count'] || '0', 10);

        // Check if we should retry
        if (
          retryCount < this.maxRetries &&
          response &&
          response.status >= 500 // Server errors
        ) {
          // Increment retry count
          config.headers!['x-retry-count'] = (retryCount + 1).toString();
          // Return new request with updated retry count
          return this.client(config);
        }

        // Otherwise, reject the promise
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get HTTP headers for requests.
   * @private
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Run a specific skill and return the result.
   *
   * @param skillName - Name of the skill to execute (e.g., "equity_research")
   * @param parameters - Skill-specific parameters
   * @returns Promise that resolves to the skill execution result
   *
   * @example
   * ```typescript
   * const result = await agent.runSkill('equity_research', {
   *   company: 'NVDA',
   *   includeFinancials: true
   * });
   * console.log(result.synthesis);
   * ```
   */
  async runSkill(
    skillName: string,
    parameters: Record<string, any> = {}
  ): Promise<SkillRunResult> {
    const endpoint = `/skills/${skillName}/run`;

    // Prepare request data
    const data = {
      parameters,
    };

    // Make request
    const response = await this.client.post<SkillRunResult>(endpoint, data);
    return response.data;
  }

  /**
   * Stream a workflow execution, yielding events as they occur.
   *
   * @param workflowName - Name of the workflow to execute
   * @param parameters - Workflow-specific parameters
   * @returns Async iterable of events
   *
   * @example
   * ```typescript
   * for await (const event of agent.streamWorkflow('macro_regime_detection', {
   *   region: 'US',
   *   timeHorizon: 'quarterly'
   * })) {
   *   console.log(`${event.type}: ${JSON.stringify(event.data)}`);
   * }
   * ```
   */
  async *streamWorkflow(
    workflowName: string,
    parameters: Record<string, any> = {}
  ): AsyncIterable<FinancialAgentEvent> {
    const endpoint = `/workflows/${workflowName}/stream`;

    // Prepare request data
    const data = {
      parameters,
    };

    // Make streaming request
    const response = await this.client.post(
      endpoint,
      data,
      {
        responseType: 'stream',
        headers: {
          ...this.getHeaders(),
          'Accept': 'text/event-stream',
        },
      }
    );

    // Process the stream
    const reader = response.data.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('data: ')) {
            // Parse Server-Sent Event
            try {
              const eventData = JSON.parse(line.slice(6)); // Remove "data: " prefix
              yield eventData as FinancialAgentEvent;
            } catch (e) {
              // Ignore malformed JSON lines
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}