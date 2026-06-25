import { createGrammarPrompt } from './grammar-prompt';
import { LLMClient } from './llm-client';

/**
 * NVIDIA NIM chat-completions client.
 *
 * Uses NVIDIA's hosted NIM endpoint at https://integrate.api.nvidia.com/v1.
 * Model defaults to meta/llama-3.1-70b-instruct but can be overridden with
 * the NVIDIA_MODEL env var (e.g. meta/llama-3.1-8b-instruct,
 * mistralai/mistral-large, etc.).
 *
 * NIM accepts the standard OpenAI-compatible schema, so we use the same
 * (messages, temperature) body. response_format is omitted because NIM models
 * are not guaranteed to support json_object — safeJsonParse handles raw JSON
 * fallback regardless.
 */
export class NvidiaNimClient implements LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    this.model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';
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
      throw new Error(`NVIDIA NIM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('NVIDIA NIM API response:', JSON.stringify(data, null, 2));

    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid response structure from NVIDIA NIM API');
    }

    return data;
  }
}
