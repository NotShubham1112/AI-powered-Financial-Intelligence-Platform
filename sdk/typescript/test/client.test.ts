/**
 * Unit tests for the TypeScript SDK client.
 */

import { FinancialAgent } from '../src/client';

// Mock axios
jest.mock('axios');

describe('FinancialAgent', () => {
  let agent: FinancialAgent;
  const mockAxios = require('axios');

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create agent instance
    agent = new FinancialAgent({
      apiKey: 'test-key',
      baseURL: 'https://test.example.com',
      timeout: 30000,
      maxRetries: 3
    });
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.apiKey).toBe('test-key');
      expect(agent.baseURL).toBe('https://test.example.com');
      expect(agent.timeout).toBe(30000);
      expect(agent.maxRetries).toBe(3);
    });

    it('should use environment variable for API key when not provided', () => {
      process.env.FINANCIAL_AGENT_API_KEY = 'env-key';
      const agent = new FinancialAgent({});
      expect(agent.apiKey).toBe('env-key');
      delete process.env.FINANCIAL_AGENT_API_KEY;
    });
  });

  describe('getHeaders', () => {
    it('should return correct headers with API key', () => {
      const headers = (agent as any).getHeaders();
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Accept']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer test-key');
    });

    it('should return correct headers without API key', () => {
      const agentNoKey = new FinancialAgent({});
      const headers = (agentNoKey as any).getHeaders();
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Accept']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('runSkill', () => {
    it('should make correct request and return result', async () => {
      // Mock response
      const mockResponse = {
        data: {
          runId: 'test-run-123',
          status: 'success',
          validation: { passed: true },
          synthesis: { result: 'test result' },
          tools: ['tool1', 'tool2'],
          executionTimeMs: 100
        }
      };
      mockAxios.post.mockResolvedValue(mockResponse);

      // Call method
      const result = await agent.runSkill('test_skill', { param1: 'value1' });

      // Verify
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/skills/test_skill/run',
        { parameters: { param1: 'value1' } }
      );
    });

    it('should retry on server errors', async () => {
      // Mock responses: 2 errors, then success
      mockAxios.post.mockRejectedValueOnce({ response: { status: 500 } });
      mockAxios.post.mockRejectedValueOnce({ response: { status: 500 } });
      mockAxios.post.mockResolvedValueOnce({
        data: {
          runId: 'test-run-123',
          status: 'success',
          validation: null,
          synthesis: { result: 'test result' },
          tools: [],
          executionTimeMs: 100
        }
      });

      // Call method
      const result = await agent.runSkill('test_skill', { param1: 'value1' });

      // Verify
      expect(result.status).toBe('success');
      expect(mockAxios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('streamWorkflow', () => {
    it('should return an async iterable', () => {
      const stream = agent.streamWorkflow('test_workflow', { param1: 'value1' });
      expect(typeof Symbol.asyncIterator === 'function' ?
        stream[Symbol.asyncIterator] :
        stream['@@asyncIterator']).toBeDefined();
    });
  });
});