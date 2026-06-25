import { NvidiaNimClient } from '../nvidia-nim';

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

describe('NvidiaNimClient', () => {
  const apiKey = 'test-nvidia-key';

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('configuration', () => {
    it('uses defaults for NVIDIA_BASE_URL and NVIDIA_MODEL when env is unset', () => {
      const originalBase = process.env.NVIDIA_BASE_URL;
      const originalModel = process.env.NVIDIA_MODEL;
      delete process.env.NVIDIA_BASE_URL;
      delete process.env.NVIDIA_MODEL;

      const client = new NvidiaNimClient(apiKey);
      expect(client).toBeDefined();

      restoreEnv('NVIDIA_BASE_URL', originalBase);
      restoreEnv('NVIDIA_MODEL', originalModel);
    });

    it('honors NVIDIA_MODEL when set', async () => {
      const original = process.env.NVIDIA_MODEL;
      process.env.NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"correctedText":"ok","errors":[],"confidence":0.9}' } }],
        }),
      });

      const client = new NvidiaNimClient(apiKey);
      await client.checkGrammar('hi', 'English', 'English', 'Spanish');

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.model).toBe('meta/llama-3.1-8b-instruct');

      restoreEnv('NVIDIA_MODEL', original);
    });

    it('honors a custom NVIDIA_BASE_URL', async () => {
      const original = process.env.NVIDIA_BASE_URL;
      process.env.NVIDIA_BASE_URL = 'https://my-nim.example/v1';

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{}' } }],
        }),
      });

      const client = new NvidiaNimClient(apiKey);
      await client.checkGrammar('hi', 'English', 'English', 'Spanish');

      expect(fetch).toHaveBeenCalledWith(
        'https://my-nim.example/v1/chat/completions',
        expect.any(Object),
      );

      restoreEnv('NVIDIA_BASE_URL', original);
    });
  });

  describe('checkGrammar', () => {
    it('sends a Bearer Authorization and plain JSON body (no response_format)', async () => {
      const original = process.env.NVIDIA_MODEL;
      delete process.env.NVIDIA_MODEL;

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{}' } }],
        }),
      });

      const client = new NvidiaNimClient(apiKey);
      await client.checkGrammar('Hello', 'English', 'English', 'English');

      expect(fetch).toHaveBeenCalledWith(
        'https://integrate.api.nvidia.com/v1/chat/completions',
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
      expect(body.messages[0].role).toBe('user');

      restoreEnv('NVIDIA_MODEL', original);
    });

    it('throws a descriptive error when the API responds non-OK', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const client = new NvidiaNimClient(apiKey);
      await expect(
        client.checkGrammar('hi', 'English', 'English', 'English'),
      ).rejects.toThrow('NVIDIA NIM API error: 403 Forbidden');
    });
  });
});
