'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TextInput from '@/components/TextInput';
import CorrectionDisplay from '@/components/CorrectionDisplay';
import ErrorTable from '@/components/ErrorTable';
import LanguageSelector from '@/components/LanguageSelector';
import HistoryPanel from '@/components/HistoryPanel';
import { GrammarCorrection, GrammarError } from '@/lib/types';
import { HistoryManager } from '@/lib/localStorage';

export default function Home() {
  const [text, setText] = useState('');
  const [inputLanguage, setInputLanguage] = useState('English');
  const [explanationLanguage, setExplanationLanguage] = useState('English');
  const [correctedText, setCorrectedText] = useState('');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GrammarCorrection[]>([]);

  // Common languages for the selectors
  const languages = [
    { code: 'English', name: 'English' },
    { code: 'Spanish', name: 'Spanish' },
    { code: 'French', name: 'French' },
    { code: 'German', name: 'German' },
    { code: 'Italian', name: 'Italian' },
    { code: 'Portuguese', name: 'Portuguese' },
    { code: 'Russian', name: 'Russian' },
    { code: 'Chinese', name: 'Chinese' },
    { code: 'Japanese', name: 'Japanese' },
    { code: 'Korean', name: 'Korean' },
  ];

  // Load history and language preferences from localStorage
  useEffect(() => {
    setHistory(HistoryManager.getHistory());
    
    // Load language preferences
    const savedPreferences = HistoryManager.getLanguagePreferences();
    if (savedPreferences) {
      setInputLanguage(savedPreferences.inputLanguage);
      setExplanationLanguage(savedPreferences.explanationLanguage);
    }
  }, []);

  // Update history when corrections are made
  const updateHistory = () => {
    const updatedHistory = HistoryManager.getHistory();
    setHistory(updatedHistory);
  };

  const handleClear = () => {
    setText('');
    setCorrectedText('');
    setErrors([]);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          inputLanguage,
          explanationLanguage,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'An error occurred while checking grammar');
      }
      
      setCorrectedText(data.correctedText);
      setErrors(data.errors || []);
      
      // Save to history
      const correction: GrammarCorrection = {
        id: uuidv4(),
        timestamp: new Date(),
        originalText: text,
        correctedText: data.correctedText,
        errors: data.errors || [],
        inputLanguage,
        explanationLanguage,
      };
      
      HistoryManager.saveCorrection(correction);
      updateHistory(); // Update history state immediately
      
      // Save language preferences
      HistoryManager.saveLanguagePreferences(inputLanguage, explanationLanguage);
    } catch (err: unknown) {
      console.error('Grammar check error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (correction: GrammarCorrection) => {
    setText(correction.originalText);
    setCorrectedText(correction.correctedText);
    setErrors(correction.errors);
    setInputLanguage(correction.inputLanguage);
    setExplanationLanguage(correction.explanationLanguage);
    
    // Save language preferences when restoring
    HistoryManager.saveLanguagePreferences(correction.inputLanguage, correction.explanationLanguage);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Grammar Correction Tool
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Check your text for grammar errors and get intelligent corrections
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <LanguageSelector
              label="Input Language"
              value={inputLanguage}
              onChange={(value) => {
                setInputLanguage(value);
                HistoryManager.saveLanguagePreferences(value, explanationLanguage);
              }}
              languages={languages}
            />
            <LanguageSelector
              label="Explanation Language"
              value={explanationLanguage}
              onChange={(value) => {
                setExplanationLanguage(value);
                HistoryManager.saveLanguagePreferences(inputLanguage, value);
              }}
              languages={languages}
            />
          </div>

          <TextInput
            text={text}
            onTextChange={setText}
            onClear={handleClear}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <CorrectionDisplay correctedText={correctedText} />
          <ErrorTable errors={errors} />
        </div>

        <HistoryPanel 
          history={history} 
          onRestore={handleRestore} 
          onDelete={(id) => {
            HistoryManager.deleteCorrection(id);
            updateHistory();
          }}
          onClearAll={() => {
            HistoryManager.clearHistory();
            updateHistory();
          }}
        />
      </div>
    </div>
  );
}