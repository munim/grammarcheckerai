import { createLLMClient } from '../llm-client';
import { OpenRouterClient } from '../openrouter';
import { NvidiaNimClient } from '../nvidia-nim';
import { CustomOpenAIClient } from '../custom-openai';

describe('createLLMClient', () => {
  const ORIGINAL_ENV = process.env;

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  function withEnv(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {};
    for (const k of Object.keys(ORIGINAL_ENV)) base[k] = ORIGINAL_ENV[k];
    for (const [k, v] of Object.entries(overrides)) base[k] = v;
    process.env = base as NodeJS.ProcessEnv;
  }

  it('defaults to OpenRouter when ACTIVE_PROVIDER is unset', () => {
    withEnv({ ACTIVE_PROVIDER: undefined, OPENROUTER_API_KEY: 'or-key' });
    const client = createLLMClient();
    expect(client).toBeInstanceOf(OpenRouterClient);
  });

  it('returns an OpenRouterClient when ACTIVE_PROVIDER=openrouter', () => {
    withEnv({ ACTIVE_PROVIDER: 'openrouter', OPENROUTER_API_KEY: 'or-key' });
    expect(createLLMClient()).toBeInstanceOf(OpenRouterClient);
  });

  it('returns a NvidiaNimClient when ACTIVE_PROVIDER=nvidia', () => {
    withEnv({ ACTIVE_PROVIDER: 'nvidia', NVIDIA_API_KEY: 'nv-key' });
    expect(createLLMClient()).toBeInstanceOf(NvidiaNimClient);
  });

  it('returns a CustomOpenAIClient when ACTIVE_PROVIDER=custom', () => {
    withEnv({
      ACTIVE_PROVIDER: 'custom',
      CUSTOM_API_KEY: 'cu-key',
      CUSTOM_BASE_URL: 'https://example.com/v1',
    });
    expect(createLLMClient()).toBeInstanceOf(CustomOpenAIClient);
  });

  it('is case-insensitive about ACTIVE_PROVIDER', () => {
    withEnv({ ACTIVE_PROVIDER: 'NVIDIA', NVIDIA_API_KEY: 'nv-key' });
    expect(createLLMClient()).toBeInstanceOf(NvidiaNimClient);
  });

  it('throws when ACTIVE_PROVIDER=openrouter but OPENROUTER_API_KEY is missing', () => {
    withEnv({ ACTIVE_PROVIDER: 'openrouter', OPENROUTER_API_KEY: undefined });
    expect(() => createLLMClient()).toThrow(/OPENROUTER_API_KEY/);
  });

  it('throws when ACTIVE_PROVIDER=nvidia but NVIDIA_API_KEY is missing', () => {
    withEnv({ ACTIVE_PROVIDER: 'nvidia', NVIDIA_API_KEY: undefined });
    expect(() => createLLMClient()).toThrow(/NVIDIA_API_KEY/);
  });

  it('throws when ACTIVE_PROVIDER=custom but CUSTOM_API_KEY is missing', () => {
    withEnv({
      ACTIVE_PROVIDER: 'custom',
      CUSTOM_API_KEY: undefined,
      CUSTOM_BASE_URL: 'https://example.com/v1',
    });
    expect(() => createLLMClient()).toThrow(/CUSTOM_API_KEY/);
  });

  it('throws when ACTIVE_PROVIDER=custom but CUSTOM_BASE_URL is missing', () => {
    withEnv({
      ACTIVE_PROVIDER: 'custom',
      CUSTOM_API_KEY: 'cu-key',
      CUSTOM_BASE_URL: undefined,
    });
    expect(() => createLLMClient()).toThrow(/CUSTOM_BASE_URL/);
  });

  it('throws a clear error for an unknown provider', () => {
    withEnv({ ACTIVE_PROVIDER: 'mistral', OPENROUTER_API_KEY: 'or-key' });
    expect(() => createLLMClient()).toThrow(/Unknown ACTIVE_PROVIDER/);
  });
});
