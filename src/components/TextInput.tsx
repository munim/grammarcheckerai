import React from 'react';

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function TextInput({ text, onTextChange, onClear, onSubmit, isLoading }: TextInputProps) {
  const charCount = text.length;
  const maxChars = 2000;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (!isLoading && text.trim().length > 0) {
        onSubmit();
      }
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter text to check
        </label>
        <span className={`text-sm ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
          {charCount}/{maxChars}
        </span>
      </div>
      
      <div className="relative">
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your text here...&#10;Press Ctrl+Enter to submit"
          rows={6}
          maxLength={maxChars}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
          disabled={isLoading}
        />
        
        {text && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Clear text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isLoading || text.trim().length === 0}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : (
            'Check Grammar'
          )}
        </button>
      </div>
      
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Tip: Press Ctrl+Enter to submit
      </div>
    </div>
  );
}