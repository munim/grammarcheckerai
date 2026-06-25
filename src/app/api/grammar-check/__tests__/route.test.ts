import 'whatwg-fetch';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';
import { createLLMClient } from '@/lib/llm-client';

jest.mock('@/lib/turnstile');
jest.mock('@/lib/llm-client');

describe('POST /api/grammar-check', () => {
  const mockVerifyTurnstile = verifyTurnstile as jest.Mock;
  const mockCreateLLMClient = createLLMClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ACTIVE_PROVIDER;
    process.env.OPENROUTER_API_KEY = 'test-api-key';
  });

  const buildRequest = (body: Record<string, unknown>) =>
    new Request('http://localhost/api/grammar-check', {
      method: 'POST',
      body: JSON.stringify(body),
    }) as NextRequest;

  it('should return 403 if Turnstile verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValue(false);

    const response = await POST(buildRequest({
      text: 'This is a test.',
      inputLanguage: 'en',
      explanationLanguage: 'en',
      targetLanguage: 'fr',
      turnstileToken: 'invalid-token',
    }));

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Turnstile verification failed');
    expect(mockVerifyTurnstile).toHaveBeenCalledWith('invalid-token');
  });

  it('should resolve the active provider and return 200 on success', async () => {
    mockVerifyTurnstile.mockResolvedValue(true);

    const mockCheckGrammar = jest.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({
        correctedText: 'This is a test.',
        errors: [],
        translatedText: 'Ceci est un test.',
      }) } }],
    });

    mockCreateLLMClient.mockReturnValue({ checkGrammar: mockCheckGrammar });

    const response = await POST(buildRequest({
      text: 'This is a test.',
      inputLanguage: 'en',
      explanationLanguage: 'en',
      targetLanguage: 'fr',
      turnstileToken: 'valid-token',
    }));

    expect(mockCreateLLMClient).toHaveBeenCalledWith(process.env);
    expect(mockCheckGrammar).toHaveBeenCalledWith('This is a test.', 'en', 'en', 'fr');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.correctedText).toBe('This is a test.');
    expect(body.translatedText).toBe('Ceci est un test.');
  });

  it('should return 500 with provider-specific guidance when factory throws (openrouter)', async () => {
    mockVerifyTurnstile.mockResolvedValue(true);
    delete process.env.OPENROUTER_API_KEY;
    mockCreateLLMClient.mockImplementation(() => {
      throw new Error('OPENROUTER_API_KEY is not configured');
    });

    const response = await POST(buildRequest({
      text: 'hi',
      inputLanguage: 'en',
      explanationLanguage: 'en',
      targetLanguage: 'fr',
      turnstileToken: 'valid',
    }));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('LLM provider is not configured');
    expect(body.provider).toBe('openrouter');
    expect(body.details).toMatch(/OPENROUTER_API_KEY/);
  });

  it('should report provider=nvidia in the error when ACTIVE_PROVIDER=nvidia is missing config', async () => {
    mockVerifyTurnstile.mockResolvedValue(true);
    process.env.ACTIVE_PROVIDER = 'nvidia';
    delete process.env.NVIDIA_API_KEY;
    mockCreateLLMClient.mockImplementation(() => {
      throw new Error('NVIDIA_API_KEY is not configured');
    });

    const response = await POST(buildRequest({
      text: 'hi',
      inputLanguage: 'en',
      explanationLanguage: 'en',
      targetLanguage: 'fr',
      turnstileToken: 'valid',
    }));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.provider).toBe('nvidia');
    expect(body.details).toMatch(/NVIDIA_API_KEY/);
  });

  it('should report provider=custom in the error when ACTIVE_PROVIDER=custom is missing config', async () => {
    mockVerifyTurnstile.mockResolvedValue(true);
    process.env.ACTIVE_PROVIDER = 'custom';
    delete process.env.CUSTOM_API_KEY;
    delete process.env.CUSTOM_BASE_URL;
    mockCreateLLMClient.mockImplementation(() => {
      throw new Error('CUSTOM_API_KEY is not configured');
    });

    const response = await POST(buildRequest({
      text: 'hi',
      inputLanguage: 'en',
      explanationLanguage: 'en',
      targetLanguage: 'fr',
      turnstileToken: 'valid',
    }));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.provider).toBe('custom');
    expect(body.details).toMatch(/CUSTOM_API_KEY|CUSTOM_BASE_URL/);
  });
});
