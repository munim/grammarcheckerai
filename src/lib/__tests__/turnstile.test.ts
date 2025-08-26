import { verifyTurnstile } from '../turnstile';

describe('verifyTurnstile', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    global.fetch = jest.fn();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('should return true for a valid token', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret-key';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await verifyTurnstile('valid-token');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'secret=test-secret-key&response=valid-token',
      }
    );
  });

  it('should return false for an invalid token', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret-key';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });

    const result = await verifyTurnstile('invalid-token');
    expect(result).toBe(false);
  });

  it('should return false if the request to cloudflare fails', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret-key';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    const result = await verifyTurnstile('any-token');
    expect(result).toBe(false);
  });

  it('should return false if TURNSTILE_SECRET_KEY is not set', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstile('any-token');
    expect(result).toBe(false);
  });

  it('should return false if fetch throws an error', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret-key';
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await verifyTurnstile('any-token');
    expect(result).toBe(false);
  });
});
