import { NextRequest } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';
import { GrammarCheckRequest } from '@/lib/types';
import { safeJsonParse, validateGrammarResponse } from '@/lib/json-utils';
import { verifyTurnstile } from '@/lib/turnstile';

export const runtime = 'edge';

interface OpenRouterResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
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
    
    // Check if API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize OpenRouter client
    const client = new OpenRouterClient(apiKey);
    
    // Call OpenRouter API
    const finalTargetLanguage = targetLanguage || explanationLanguage;
    const response: OpenRouterResponse = await client.checkGrammar(text, inputLanguage, explanationLanguage, finalTargetLanguage) as OpenRouterResponse;
    
    // Extract the content from the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenRouter API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the JSON response using our safe parsing utility
    let parsedResponse;
    try {
      parsedResponse = safeJsonParse(content);
    } catch (parseError: unknown) {
      console.error('Failed to parse OpenRouter response after all attempts:', parseError);
      console.error('Raw content preview:', content.substring(0, 500));
      
      return new Response(
        JSON.stringify({
          error: 'Failed to parse OpenRouter response as JSON',
          rawResponse: content.substring(0, 1000), // Limit size for debugging
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
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
          error: 'Invalid response structure from OpenRouter API',
          validationError: validationError instanceof Error ? validationError.message : 'Unknown validation error',
          rawResponse: content.substring(0, 500)
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