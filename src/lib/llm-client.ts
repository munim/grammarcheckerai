import { OpenRouterClient } from './openrouter';
import { NvidiaNimClient } from './nvidia-nim';
import { CustomOpenAIClient } from './custom-openai';

/** Available provider identifiers for the ACTIVE_PROVIDER env var. */
export type LLMProviderId = 'openrouter' | 'nvidia' | 'custom';

/** Uniform interface every provider client must implement. */
export interface LLMClient {
  /**
   * Calls the provider's chat-completions endpoint with the grammar-correction
   * prompt and returns the raw provider response. The route handler is
   * responsible for parsing the response into the standard grammar schema.
   */
  checkGrammar(
    text: string,
    inputLanguage: string,
    explanationLanguage: string,
    targetLanguage: string,
  ): Promise<unknown>;
}

/**
 * Build the LLMClient for the provider selected by ACTIVE_PROVIDER.
 *
 * Called once per request inside the route handler so that runtime edits to
 * process.env on edge platforms take effect without a redeploy.
 *
 * Defaults to OpenRouter for backward compatibility with existing deployments
 * that only set OPENROUTER_API_KEY + OPENROUTER_MODEL.
 */
export function createLLMClient(env: NodeJS.ProcessEnv = process.env): LLMClient {
  const provider = ((env.ACTIVE_PROVIDER ?? 'openrouter').trim().toLowerCase()) as LLMProviderId;

  switch (provider) {
    case 'openrouter': {
      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }
      return new OpenRouterClient(apiKey);
    }
    case 'nvidia': {
      const apiKey = env.NVIDIA_API_KEY;
      if (!apiKey) {
        throw new Error('NVIDIA_API_KEY is not configured');
      }
      return new NvidiaNimClient(apiKey);
    }
    case 'custom': {
      const apiKey = env.CUSTOM_API_KEY;
      const baseUrl = env.CUSTOM_BASE_URL;
      if (!apiKey) {
        throw new Error('CUSTOM_API_KEY is not configured');
      }
      if (!baseUrl) {
        throw new Error('CUSTOM_BASE_URL is not configured');
      }
      return new CustomOpenAIClient({ apiKey, baseUrl });
    }
    default:
      throw new Error(
        `Unknown ACTIVE_PROVIDER "${env.ACTIVE_PROVIDER}". Supported values: openrouter, nvidia, custom.`,
      );
  }
}
