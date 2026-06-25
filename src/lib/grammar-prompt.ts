/**
 * Shared prompt builder used by every supported LLM provider.
 *
 * Keeping the prompt in one place ensures the JSON output schema stays in sync
 * with the parsing logic in src/lib/json-utils.ts. If you change the schema,
 * update validateGrammarResponse as well.
 */
export function createGrammarPrompt(
  text: string,
  inputLanguage: string,
  explanationLanguage: string,
  targetLanguage: string,
): string {
  return `You are a grammar correction expert. Analyze the following ${inputLanguage} text for grammar errors and provide corrections. Also, translate the corrected text to ${targetLanguage}.

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
  "confidence": 0.95,
  "translatedText": "translation of the corrected text to ${targetLanguage}"
}

Important instructions:
1. Identify all grammar errors in the text
2. Provide corrected versions
3. Explain each error in ${explanationLanguage}
4. Translate the corrected text to ${targetLanguage}
5. Return ONLY valid JSON
6. If no errors are found, return an empty errors array
7. Ensure the correctedText is a fully corrected version of the input`;
}
