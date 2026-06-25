import { createGrammarPrompt } from './grammar-prompt';
import { LLMClient } from './llm-client';

export interface CustomOpenAIClientOptions {
  /** Bearer token for the endpoint. */
  apiKey: string;
  /** Full chat-completions base URL, e.g. http://localhost:11434/v1 */
  baseUrl: string;
  /** Optional model override; otherwise read CUSTOM_MODEL env var. */
  model?: string;
}

/**
 * Generic OpenAI-compatible chat-completions client.
 *
 * Use this to point at any endpoint that speaks the OpenAI Chat Completions
 * schema — e.g. a self-hosted vLLM server, LM Studio, Ollama's
 * OpenAI-compatible listener, or a third-party proxy.
 *
 * The endpoint base URL is taken from CUSTOM_BASE_URL (constructor arg). The
 * model defaults to CUSTOM_MODEL or 'gpt-3.5-turbo' (OpenAI-compatible default).
 *
 * response_format is omitted because many local endpoints reject json_object;
 * safeJsonParse handles plain JSON output.
 */
export class CustomOpenAIClient implements LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor({ apiKey, baseUrl, model }: CustomOpenAIClientOptions) {
    this.apiKey = apiKey;
    // Strip trailing slashes so `${baseUrl}/chat/completions` is well formed
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model || process.env.CUSTOM_MODEL || 'gpt-3.5-turbo';
  }

  async checkGrammar(
    text: string,
    inputLanguage: string,
    explanationLanguage: string,
    targetLanguage: string,
  ): Promise<unknown> {
    const prompt = createGrammarPrompt(text, inputLanguage, explanationLanguage, targetLanguage);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom OpenAI-compatible API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Custom OpenAI-compatible API response:', JSON.stringify(data, null, 2));

    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid response structure from custom OpenAI-compatible API');
    }

    return data;
  }
}
