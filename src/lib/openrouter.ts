export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  async checkGrammar(text: string, inputLanguage: string, explanationLanguage: string): Promise<unknown> {
    const prompt = this.createPrompt(text, inputLanguage, explanationLanguage);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTJS_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  private createPrompt(text: string, inputLanguage: string, explanationLanguage: string): string {
    return `You are a grammar correction expert. Analyze the following ${inputLanguage} text for grammar errors and provide corrections.

Text to analyze: "${text}"

Please respond with a JSON object in this exact format:
{
  "correctedText": "corrected version of the text",
  "errors": [
    {
      "original": "original text with error",
      "corrected": "corrected version of that text",
      "errorType": "type of grammar error",
      "explanation": "explanation of the error in ${explanationLanguage}",
      "position": position_in_text
    }
  ],
  "confidence": 0.95
}

Important instructions:
1. Identify all grammar errors in the text
2. Provide corrected versions
3. Explain each error in ${explanationLanguage}
4. Return ONLY valid JSON
5. If no errors are found, return an empty errors array
6. Ensure the correctedText is a fully corrected version of the input`;
  }
}