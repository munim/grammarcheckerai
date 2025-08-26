import { OpenRouterClient } from '../openrouter';

// Mock fetch
global.fetch = jest.fn();

describe('OpenRouterClient', () => {
  const apiKey = 'test-api-key';
  let client: OpenRouterClient;

  beforeEach(() => {
    client = new OpenRouterClient(apiKey);
    (fetch as jest.Mock).mockClear();
  });

  describe('checkGrammar', () => {
    it('should make a request to the OpenRouter API with correct parameters', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              correctedText: 'This is a corrected sentence.',
              errors: [],
              confidence: 0.95,
              translatedText: 'Ceci est une phrase corrigée.'
            })
          }
        }]
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const text = 'This is a test.';
      const inputLanguage = 'English';
      const explanationLanguage = 'English';
      const targetLanguage = 'French';
      
      await client.checkGrammar(text, inputLanguage, explanationLanguage, targetLanguage);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
          },
        })
      );
      
      // Check that the body contains the expected content
      const call = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.model).toBe('qwen/qwen3-30b-a3b:free');
      expect(body.messages[0].role).toBe('user');
      expect(body.messages[0].content).toContain(text);
      expect(body.messages[0].content).toContain(targetLanguage);
      expect(body.temperature).toBe(0.7);
      expect(body.response_format.type).toBe('json_object');
    });

    it('should throw an error when the API response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(
        client.checkGrammar('Test text', 'English', 'English', 'French')
      ).rejects.toThrow('OpenRouter API error: 401 Unauthorized');
    });
  });
});