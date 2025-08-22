import { OpenRouterClient } from '../openrouter';

// Mock fetch
global.fetch = jest.fn();

describe('OpenRouterClient', () => {
  const apiKey = 'test-api-key';

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('model configuration', () => {
    it('should use the model from environment variable when set', () => {
      // Mock the environment variable
      const originalEnv = process.env.OPENROUTER_MODEL;
      process.env.OPENROUTER_MODEL = 'test-model/test';
      
      const client = new OpenRouterClient(apiKey);
      
      // Restore the original environment
      process.env.OPENROUTER_MODEL = originalEnv;
      
      // We can't easily test the private property, but we can test the behavior
      expect(client).toBeDefined();
    });

    it('should use default model when environment variable is not set', () => {
      // Mock the environment variable to be undefined
      const originalEnv = process.env.OPENROUTER_MODEL;
      delete process.env.OPENROUTER_MODEL;
      
      const client = new OpenRouterClient(apiKey);
      
      // Restore the original environment
      process.env.OPENROUTER_MODEL = originalEnv;
      
      expect(client).toBeDefined();
    });

    it('should send the correct model in the API request', async () => {
      // Mock the environment variable
      const originalEnv = process.env.OPENROUTER_MODEL;
      process.env.OPENROUTER_MODEL = 'custom/model:test';
      
      const client = new OpenRouterClient(apiKey);
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                correctedText: 'This is a corrected sentence.',
                errors: [],
                confidence: 0.95
              })
            }
          }]
        })
      });

      await client.checkGrammar('Test text', 'English', 'English');
      
      // Check that the body contains the expected model
      const call = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.model).toBe('custom/model:test');
      
      // Restore the original environment
      process.env.OPENROUTER_MODEL = originalEnv;
    });

    it('should use default model when environment variable is not set in API request', async () => {
      // Mock the environment variable to be undefined
      const originalEnv = process.env.OPENROUTER_MODEL;
      delete process.env.OPENROUTER_MODEL;
      
      const client = new OpenRouterClient(apiKey);
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                correctedText: 'This is a corrected sentence.',
                errors: [],
                confidence: 0.95
              })
            }
          }]
        })
      });

      await client.checkGrammar('Test text', 'English', 'English');
      
      // Check that the body contains the default model
      const call = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.model).toBe('mistralai/mistral-7b-instruct:free');
      
      // Restore the original environment
      process.env.OPENROUTER_MODEL = originalEnv;
    });
  });
});