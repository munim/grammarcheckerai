import { GrammarCorrection } from './types';

const HISTORY_KEY = 'grammar-correction-history';
const LANGUAGE_PREFERENCES_KEY = 'language-preferences';
const MAX_HISTORY_ITEMS = 50;

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export class HistoryManager {
  static getHistory(): GrammarCorrection[] {
    if (!isLocalStorageAvailable()) return [];
    
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (_error: unknown) {
      console.error('Error reading history from localStorage:', _error);
      return [];
    }
  }

  static saveCorrection(correction: GrammarCorrection): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      const history = this.getHistory();
      history.unshift(correction);
      
      // Keep only the most recent items
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(MAX_HISTORY_ITEMS);
      }
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (_error: unknown) {
      console.error('Error saving correction to localStorage:', _error);
    }
  }

  static deleteCorrection(id: string): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (_error: unknown) {
      console.error('Error deleting correction from localStorage:', _error);
    }
  }

  static clearHistory(): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (_error: unknown) {
      console.error('Error clearing history from localStorage:', _error);
    }
  }

  static getLanguagePreferences(): { inputLanguage: string; explanationLanguage: string } | null {
    if (!isLocalStorageAvailable()) return null;
    
    try {
      const preferences = localStorage.getItem(LANGUAGE_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : null;
    } catch (_error: unknown) {
      console.error('Error reading language preferences from localStorage:', _error);
      return null;
    }
  }

  static saveLanguagePreferences(inputLanguage: string, explanationLanguage: string): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      const preferences = { inputLanguage, explanationLanguage };
      localStorage.setItem(LANGUAGE_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (_error: unknown) {
      console.error('Error saving language preferences to localStorage:', _error);
    }
  }
}