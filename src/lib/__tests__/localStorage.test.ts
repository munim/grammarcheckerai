import { HistoryManager } from '../localStorage';
import { GrammarCorrection } from '../../types';

// Mock the localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('HistoryManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
  });

  describe('getHistory', () => {
    it('should return an empty array when no history exists', () => {
      const history = HistoryManager.getHistory();
      expect(history).toEqual([]);
    });

    it('should return parsed history when it exists', () => {
      // Create a mock history with a specific timestamp
      const timestamp = new Date('2023-01-01T00:00:00Z');
      const mockHistory: GrammarCorrection[] = [
        {
          id: '1',
          timestamp: timestamp,
          originalText: 'This is a test.',
          correctedText: 'This is a test.',
          errors: [],
          inputLanguage: 'English',
          explanationLanguage: 'English'
        }
      ];
      
      mockLocalStorage.setItem('grammar-correction-history', JSON.stringify(mockHistory));
      
      const history = HistoryManager.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('1');
      expect(history[0].originalText).toBe('This is a test.');
      expect(new Date(history[0].timestamp)).toEqual(timestamp);
    });

    it('should return an empty array when localStorage contains invalid JSON', () => {
      mockLocalStorage.setItem('grammar-correction-history', 'invalid json');
      
      const history = HistoryManager.getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('saveCorrection', () => {
    it('should save a correction to localStorage', () => {
      const timestamp = new Date('2023-01-01T00:00:00Z');
      const correction: GrammarCorrection = {
        id: '1',
        timestamp: timestamp,
        originalText: 'This is a test.',
        correctedText: 'This is a test.',
        errors: [],
        inputLanguage: 'English',
        explanationLanguage: 'English'
      };
      
      HistoryManager.saveCorrection(correction);
      
      const savedHistory = JSON.parse(mockLocalStorage.getItem('grammar-correction-history') || '[]');
      expect(savedHistory).toHaveLength(1);
      expect(savedHistory[0].id).toBe('1');
      expect(savedHistory[0].originalText).toBe('This is a test.');
      expect(new Date(savedHistory[0].timestamp)).toEqual(timestamp);
    });

    it('should limit history to 50 items', () => {
      // Create 55 corrections
      const corrections: GrammarCorrection[] = [];
      for (let i = 0; i < 55; i++) {
        corrections.push({
          id: `${i}`,
          timestamp: new Date(`2023-01-01T00:00:00Z`),
          originalText: `Test ${i}`,
          correctedText: `Test ${i}`,
          errors: [],
          inputLanguage: 'English',
          explanationLanguage: 'English'
        });
      }
      
      // Save all corrections
      corrections.forEach(correction => {
        HistoryManager.saveCorrection(correction);
      });
      
      const savedHistory = HistoryManager.getHistory();
      expect(savedHistory).toHaveLength(50);
      // The first 5 items should have been removed (0-4)
      expect(savedHistory[0].id).toBe('54'); // Most recent first
      expect(savedHistory[49].id).toBe('5'); // Oldest in the limited history
    });
  });

  describe('deleteCorrection', () => {
    it('should delete a correction by id', () => {
      const corrections: GrammarCorrection[] = [
        {
          id: '1',
          timestamp: new Date('2023-01-01T00:00:00Z'),
          originalText: 'Test 1',
          correctedText: 'Test 1',
          errors: [],
          inputLanguage: 'English',
          explanationLanguage: 'English'
        },
        {
          id: '2',
          timestamp: new Date('2023-01-01T00:00:00Z'),
          originalText: 'Test 2',
          correctedText: 'Test 2',
          errors: [],
          inputLanguage: 'English',
          explanationLanguage: 'English'
        }
      ];
      
      // Save corrections
      corrections.forEach(correction => {
        HistoryManager.saveCorrection(correction);
      });
      
      // Delete the first correction
      HistoryManager.deleteCorrection('1');
      
      const savedHistory = HistoryManager.getHistory();
      expect(savedHistory).toHaveLength(1);
      expect(savedHistory[0].id).toBe('2');
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const correction: GrammarCorrection = {
        id: '1',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        originalText: 'This is a test.',
        correctedText: 'This is a test.',
        errors: [],
        inputLanguage: 'English',
        explanationLanguage: 'English'
      };
      
      HistoryManager.saveCorrection(correction);
      HistoryManager.clearHistory();
      
      const history = HistoryManager.getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('getLanguagePreferences', () => {
    it('should return null when no preferences exist', () => {
      const preferences = HistoryManager.getLanguagePreferences();
      expect(preferences).toBeNull();
    });

    it('should return parsed preferences when they exist', () => {
      const mockPreferences = {
        inputLanguage: 'Spanish',
        explanationLanguage: 'English'
      };
      
      mockLocalStorage.setItem('language-preferences', JSON.stringify(mockPreferences));
      
      const preferences = HistoryManager.getLanguagePreferences();
      expect(preferences).toEqual(mockPreferences);
    });
  });

  describe('saveLanguagePreferences', () => {
    it('should save language preferences to localStorage', () => {
      HistoryManager.saveLanguagePreferences('French', 'German');
      
      const savedPreferences = JSON.parse(mockLocalStorage.getItem('language-preferences') || '{}');
      expect(savedPreferences).toEqual({
        inputLanguage: 'French',
        explanationLanguage: 'German'
      });
    });
  });
});