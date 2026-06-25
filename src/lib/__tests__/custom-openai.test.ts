import { CustomOpenAIClient } from '../custom-openai';

// Mock fetch
global.fetch = jest.fn();

/** Restore an env var cleanly: delete if originally undefined, otherwise set. */
function restoreEnv(key: string, original: string | undefined) {
  if (original === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = original;
  }
}

describe('CustomOpenAIClient', () => {
  const apiKey = 'test-custom-key';
  const baseUrl = 'https://llm.example.com/v1';

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('configuration', () => {
    it('strips trailing slashes from the baseUrl', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{}' } }],
        }),
      });

      const client = new CustomOpenAIClient({ apiKey, baseUrl: 'https://llm.example.com/v1///' });
      await client.checkGrammar('hi', 'English', 'English', 'English');

      expect(fetch).toHaveBeenCalledWith(
        'https://llm.example.com/v1/chat/completions',
        expect.any(Object),
      );
    });

    it('uses CUSTOM_MODEL env var when no model is passed in', async () => {
      const original = process.env.CUSTOM_MODEL;
      process.env.CUSTOM_MODEL = 'llama3.1:70b';

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{}' } }],
        }),
      });

      const client = new CustomOpenAIClient({ apiKey, baseUrl });
      await client.checkGrammar('hi', 'English', 'English', 'English');

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.model).toBe('llama3.1:70b');

      restoreEnv('CUSTOM_MODEL', original);
    });

    it('prefers an explicit model over the env var', async () => {
      const original = process.env.CUSTOM_MODEL;
      process.env.CUSTOM_MODEL = 'env-model';

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{}' } }],
        }),
      });

      const client = new CustomOpenAIClient({ apiKey, baseUrl, model: 'explicit-model' });
      await client.checkGrammar('hi', 'English', 'English', 'English');

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.model).toBe('explicit-model');

      restoreEnv('CUSTOM_MODEL', original);
    });
  });

  describe('checkGrammar', () => {
    it('sends a Bearer Authorization, Accept header, and plain JSON body (no response_format)', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{}' } }],
        }),
      });

      const client = new CustomOpenAIClient({ apiKey, baseUrl });
      await client.checkGrammar('Hello', 'English', 'English', 'English');

      expect(fetch).toHaveBeenCalledWith(
        'https://llm.example.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }),
      );

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(body).not.toHaveProperty('response_format');
    });

    it('throws a descriptive error when the API responds non-OK', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      const client = new CustomOpenAIClient({ apiKey, baseUrl });
      await expect(
        client.checkGrammar('hi', 'English', 'English', 'English'),
      ).rejects.toThrow('Custom OpenAI-compatible API error: 500 Server Error');
    });
  });
});
