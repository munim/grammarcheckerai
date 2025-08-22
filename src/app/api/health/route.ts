import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(_request: NextRequest) {
  return new Response(
    JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'grammar-correction-tool'
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    }
  );
}