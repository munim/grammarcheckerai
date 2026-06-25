import { NextRequest } from 'next/server';
import { createLLMClient, LLMProviderId } from '@/lib/llm-client';
import { GrammarCheckRequest } from '@/lib/types';
import { safeJsonParse, validateGrammarResponse } from '@/lib/json-utils';
import { verifyTurnstile } from '@/lib/turnstile';

export const runtime = 'edge';

interface ChatCompletionsResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/**
 * Build a human-friendly error message describing which env vars are missing
 * for the requested provider. This is returned to the client so operators can
 * debug configuration issues without checking container logs.
 */
function describeMissingConfig(provider: string): string {
  switch (provider) {
    case 'openrouter':
      return "OpenRouter is selected (ACTIVE_PROVIDER='openrouter') but OPENROUTER_API_KEY is not set.";
    case 'nvidia':
      return "NVIDIA NIM is selected (ACTIVE_PROVIDER='nvidia') but NVIDIA_API_KEY is not set.";
    case 'custom':
      return "Custom OpenAI-compatible endpoint is selected (ACTIVE_PROVIDER='custom') but CUSTOM_API_KEY and/or CUSTOM_BASE_URL is not set.";
    default:
      return `Unknown ACTIVE_PROVIDER '${provider}'. Supported values: openrouter, nvidia, custom.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, inputLanguage, explanationLanguage, targetLanguage, turnstileToken }: GrammarCheckRequest = await request.json();

    // Verify Turnstile token
    const isTurnstileValid = await verifyTurnstile(turnstileToken);
    if (!isTurnstileValid) {
      return new Response(
        JSON.stringify({ error: 'Turnstile verification failed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!inputLanguage || !explanationLanguage) {
      return new Response(
        JSON.stringify({ error: 'Both inputLanguage and explanationLanguage are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Resolve the active provider BEFORE touching any keys so we can return
    // a specific, actionable error message to the operator.
    const activeProvider: LLMProviderId =
      ((process.env.ACTIVE_PROVIDER || 'openrouter').toLowerCase() as LLMProviderId);

    // Pick a client for the active provider. The factory throws if a required
    // env var is missing; we convert that into a 500 with a clear message.
    let client;
    try {
      client = createLLMClient(process.env);
    } catch (clientError: unknown) {
      const message = clientError instanceof Error ? clientError.message : 'Unknown client error';
      console.error('Failed to create LLM client:', message);
      return new Response(
        JSON.stringify({
          error: 'LLM provider is not configured',
          details: describeMissingConfig(activeProvider),
          provider: activeProvider,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call the active provider
    const finalTargetLanguage = targetLanguage || explanationLanguage;
    const response: ChatCompletionsResponse = await client.checkGrammar(
      text,
      inputLanguage,
      explanationLanguage,
      finalTargetLanguage,
    ) as ChatCompletionsResponse;

    // Extract the message content
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from LLM provider' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response using our safe parsing utility
    let parsedResponse;
    try {
      parsedResponse = safeJsonParse(content);
    } catch (parseError: unknown) {
      console.error('Failed to parse LLM response after all attempts:', parseError);
      console.error('Raw content preview:', content.substring(0, 500));

      return new Response(
        JSON.stringify({
          error: 'Failed to parse LLM response as JSON',
          rawResponse: content.substring(0, 1000),
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate and normalize the response structure
    try {
      parsedResponse = validateGrammarResponse(parsedResponse, text);
    } catch (validationError: unknown) {
      console.error('Response validation failed:', validationError);

      return new Response(
        JSON.stringify({
          error: 'Invalid response structure from LLM provider',
          validationError: validationError instanceof Error ? validationError.message : 'Unknown validation error',
          rawResponse: content.substring(0, 500),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Grammar check error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
