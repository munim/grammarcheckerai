import 'whatwg-fetch';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';
import { OpenRouterClient } from '@/lib/openrouter';

jest.mock('@/lib/turnstile');
jest.mock('@/lib/openrouter');

describe('POST /api/grammar-check', () => {
  const mockVerifyTurnstile = verifyTurnstile as jest.Mock;
  const mockOpenRouterClient = OpenRouterClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENROUTER_API_KEY = 'test-api-key';
  });

  it('should return 403 if Turnstile verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValue(false);

    const request = new Request('http://localhost/api/grammar-check', {
      method: 'POST',
      body: JSON.stringify({
        text: 'This is a test.',
        inputLanguage: 'en',
        explanationLanguage: 'en',
        turnstileToken: 'invalid-token',
      }),
    }) as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Turnstile verification failed');
    expect(mockVerifyTurnstile).toHaveBeenCalledWith('invalid-token');
  });

  it('should call OpenRouter and return 200 if Turnstile verification succeeds', async () => {
    mockVerifyTurnstile.mockResolvedValue(true);
    const mockCheckGrammar = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              correctedText: 'This is a test.',
              errors: [],
            }),
          },
        },
      ],
    });
    mockOpenRouterClient.prototype.checkGrammar = mockCheckGrammar;

    const request = new Request('http://localhost/api/grammar-check', {
      method: 'POST',
      body: JSON.stringify({
        text: 'This is a test.',
        inputLanguage: 'en',
        explanationLanguage: 'en',
        turnstileToken: 'valid-token',
      }),
    }) as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.correctedText).toBe('This is a test.');
    expect(mockVerifyTurnstile).toHaveBeenCalledWith('valid-token');
    expect(mockCheckGrammar).toHaveBeenCalledWith('This is a test.', 'en', 'en');
  });
});
