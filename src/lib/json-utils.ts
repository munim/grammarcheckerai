/**
 * Utility functions for handling JSON parsing with potential formatting issues
 */

/**
 * Safely parse JSON content that may contain control characters or formatting issues
 * @param content - The raw JSON string to parse
 * @returns Parsed JSON object
 * @throws Error if parsing fails after all attempts
 */
export function safeJsonParse(content: string): any {
  // First attempt: try parsing as-is after trimming
  let cleanedContent = content.trim();
  
  try {
    return JSON.parse(cleanedContent);
  } catch (firstError) {
    console.log('First JSON parse attempt failed:', firstError);
  }

  // Second attempt: Handle cases where the response might have extra formatting
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    try {
      return JSON.parse(cleanedContent);
    } catch (secondError) {
      console.log('Second JSON parse attempt failed:', secondError);
    }
  }

  // Third attempt: Extract JSON object boundaries
  try {
    const startIndex = content.indexOf('{');
    const lastIndex = content.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      const extractedJson = content.substring(startIndex, lastIndex + 1);
      return JSON.parse(extractedJson);
    }
  } catch (thirdError) {
    console.log('Third JSON parse attempt failed:', thirdError);
  }

  // Fourth attempt: More aggressive cleaning
  try {
    let fixedContent = content.trim();
    
    // Remove any non-JSON content before the first {
    const firstBrace = fixedContent.indexOf('{');
    if (firstBrace > 0) {
      fixedContent = fixedContent.substring(firstBrace);
    }
    
    // Remove any non-JSON content after the last }
    const lastBrace = fixedContent.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace < fixedContent.length - 1) {
      fixedContent = fixedContent.substring(0, lastBrace + 1);
    }
    
    return JSON.parse(fixedContent);
  } catch (fourthError) {
    console.log('Fourth JSON parse attempt failed:', fourthError);
  }

  // Fifth attempt: Simple and reliable approach
  try {
    let fixedContent = content.trim();
    
    // Extract JSON boundaries first
    const startIndex = fixedContent.indexOf('{');
    const lastIndex = fixedContent.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      fixedContent = fixedContent.substring(startIndex, lastIndex + 1);
    }
    
    // Simple approach: process character by character and fix control characters in strings
    let result = '';
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < fixedContent.length; i++) {
      const char = fixedContent[i];
      
      if (escaped) {
        result += char;
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        result += char;
        escaped = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }
      
      if (inString) {
        // We're inside a string, escape control characters
        switch (char) {
          case '\n':
            result += '\\n';
            break;
          case '\r':
            result += '\\r';
            break;
          case '\t':
            result += '\\t';
            break;
          case '\f':
            result += '\\f';
            break;
          case '\b':
            result += '\\b';
            break;
          case '\v':
            result += '\\v';
            break;
          default:
            result += char;
        }
      } else {
        result += char;
      }
    }
    
    return JSON.parse(result);
  } catch (fifthError) {
    console.log('Fifth JSON parse attempt failed:', fifthError);
    
    // If all attempts fail, throw a comprehensive error
    throw new Error(`Failed to parse JSON after multiple attempts. Original content preview: ${content.substring(0, 200)}`);
  }
}

/**
 * Validate that a parsed JSON object has the expected grammar correction structure
 * @param obj - The parsed object to validate
 * @param fallbackText - Fallback text to use if correctedText is missing
 * @returns Validated and normalized grammar correction object
 */
export function validateGrammarResponse(obj: any, fallbackText: string = ''): any {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  // Ensure required fields exist with fallbacks
  const result = {
    correctedText: obj.correctedText || fallbackText,
    errors: Array.isArray(obj.errors) ? obj.errors : [],
    confidence: typeof obj.confidence === 'number' ? obj.confidence : 0.5
  };

  return result;
}