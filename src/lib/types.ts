export interface GrammarError {
  original: string;
  corrected: string;
  errorType: string;
  explanation: string;
  position: number;
}

export interface GrammarCorrection {
  id: string;
  timestamp: Date;
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
  inputLanguage: string;
  explanationLanguage: string;
  translatedText?: string;
  targetLanguage?: string;
}

export interface GrammarCheckRequest {
  text: string;
  inputLanguage: string;
  explanationLanguage: string;
  targetLanguage: string;
  turnstileToken: string;
}

export interface GrammarCheckResponse {
  correctedText: string;
  errors: GrammarError[];
  confidence: number;
  translatedText?: string;
}