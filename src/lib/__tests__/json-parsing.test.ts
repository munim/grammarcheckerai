import { describe, it, expect } from '@jest/globals';
import { safeJsonParse, validateGrammarResponse } from '../json-utils';

describe('JSON Parsing Tests', () => {
  it('should parse the provided LLM response correctly', () => {
    const mockLLMResponse = `{\n  "correctedText": "Sehr geehrte Damen und Herren,\n\nIch schreibe Ihnen, weil ich Urlaub in München machen möchte. Ich wollte für drei Tage in München bleiben. Können Sie mir helfen, einen günstigen Hotel in der Stadt zu finden? Ich habe viel Interesse an Museen. Können Sie Ihnen Sehenswürdigkeiten am besten Preis angeben?\n\nIch warte auf Ihre Antwort,\n\nmit freundlichen Grußen,\nAbdul Munim",\n  "errors": [\n    {\n      "original": "Ich schreibe Ihnen weil ich in München Urlaub machen möchte.",\n      "corrected": "Ich schreibe Ihnen, weil ich Urlaub in München machen möchte.",\n      "errorType": "Punctuation",\n      "explanation": "The comma after \'Ich\' is incorrect. It should be followed by a word or a complete sentence with a comma.",\n      "position": 1\n    },\n    {\n      "original": "Ich wollte in München für 3 Tagen bleigen.",\n      "corrected": "Ich wollte für drei Tagen in München bleiben.",\n      "errorType": "Word order",\n      "explanation": "The word order in the infinitive phrase is incorrect. \'Für\' should come before \'drei Tagen\'.",\n      "position": 5\n    },\n    {\n      "original": "Können Sie mir hiflen auf einen Güntige Hotel in der Stadt finden?",\n      "corrected": "Können Sie mir helfen, einen günstigen Hotel in der Stadt zu finden?",\n      "errorType": "Spelling",\n      "explanation": "The word \'Güntige\' is misspelled. It should be \'günstige\'.",\n      "position": 9\n    },\n    {\n      "original": "Können Sie Sehenwürdigkeiten list am besten Preis geben?",\n      "corrected": "Können Sie Ihnen Sehenswürdigkeiten am besten Preis angeben?",\n      "errorType": "Pronoun usage",\n      "explanation": "The pronoun \'Sie\' should be used consistently. It should be \'Ihnen\' instead of \'Sehenwürdigkeiten\'.",\n      "position": 15\n    }\n  ],\n  "confidence": 0.95\n}`;

    // Test direct parsing - this should fail due to control characters
    expect(() => JSON.parse(mockLLMResponse)).toThrow();
    
    // Test with our safe parsing logic
    const parsed = safeJsonParse(mockLLMResponse);
    expect(parsed).toHaveProperty('correctedText');
    expect(parsed).toHaveProperty('errors');
    expect(parsed).toHaveProperty('confidence');
    expect(Array.isArray(parsed.errors)).toBe(true);
    expect(parsed.errors).toHaveLength(4);
    
    // Test validation
    const validated = validateGrammarResponse(parsed, 'fallback text');
    expect(validated.correctedText).toBeTruthy();
    expect(Array.isArray(validated.errors)).toBe(true);
    expect(typeof validated.confidence).toBe('number');
  });

  it('should handle JSON with extra whitespace and formatting', () => {
    const messyJson = `   {\n  "correctedText": "Test text",\n  "errors": [],\n  "confidence": 0.95\n}   `;
    
    const cleanedContent = messyJson.trim();
    expect(() => JSON.parse(cleanedContent)).not.toThrow();
    
    const parsed = JSON.parse(cleanedContent);
    expect(parsed.correctedText).toBe('Test text');
    expect(parsed.errors).toEqual([]);
    expect(parsed.confidence).toBe(0.95);
  });

  it('should extract JSON from content with extra text', () => {
    const contentWithExtra = `Some extra text before {\n  "correctedText": "Test",\n  "errors": [],\n  "confidence": 0.95\n} and some text after`;
    
    const startIndex = contentWithExtra.indexOf('{');
    const lastIndex = contentWithExtra.lastIndexOf('}');
    const extractedJson = contentWithExtra.substring(startIndex, lastIndex + 1);
    
    expect(() => JSON.parse(extractedJson)).not.toThrow();
    
    const parsed = JSON.parse(extractedJson);
    expect(parsed.correctedText).toBe('Test');
  });
});