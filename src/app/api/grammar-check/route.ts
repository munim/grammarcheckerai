import { NextRequest } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';
import { GrammarCheckRequest } from '@/lib/types';

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
    const { text, inputLanguage, explanationLanguage }: GrammarCheckRequest = await request.json();
    
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
    const response: OpenRouterResponse = await client.checkGrammar(text, inputLanguage, explanationLanguage) as OpenRouterResponse;
    
    // Extract the content from the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenRouter API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError: unknown) {
      // If JSON parsing fails, return the raw content for debugging
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse OpenRouter response as JSON',
          rawResponse: content 
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