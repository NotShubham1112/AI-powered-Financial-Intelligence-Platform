/**
 * Data models for the TypeScript SDK API responses.
 */

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
 * Base event interface for financial agent events.
 */
export interface FinancialAgentEvent {
  /** Type of event */
  type: string; // In practice, this would be a union of specific event types
  /** Event-specific data */
  data: Record<string, any>;
  /** Timestamp of when the event was generated */
  timestamp?: string;
}