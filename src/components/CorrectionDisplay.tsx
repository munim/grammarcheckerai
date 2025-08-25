import React, { useState } from 'react';
import { GrammarError } from '@/lib/types';
import Tooltip from './Tooltip';

interface CorrectionDisplayProps {
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
}

export default function CorrectionDisplay({ originalText, correctedText, errors }: CorrectionDisplayProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [showHighlighting, setShowHighlighting] = useState(true);

  if (!correctedText) return null;

  const renderOriginalWithErrors = () => {
    if (!errors || errors.length === 0) {
      return <span>{originalText}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort errors by their position in the original text
    const sortedErrors = [...errors].sort((a, b) => {
      const aIndex = originalText.indexOf(a.original);
      const bIndex = originalText.indexOf(b.original);
      return aIndex - bIndex;
    });

    sortedErrors.forEach((error, i) => {
      const originalIndex = originalText.indexOf(error.original, lastIndex);
      
      if (originalIndex !== -1) {
        // Add text before this error
        if (originalIndex > lastIndex) {
          parts.push(
            <span key={`before-${i}`}>
              {originalText.slice(lastIndex, originalIndex)}
            </span>
          );
        }

        // Add the original error text with strikethrough and red background
        parts.push(
          <Tooltip
            key={`error-${i}`}
            content={`Error: ${error.explanation}`}
            position="top"
          >
            <span className="bg-red-100 text-red-800 line-through px-1 rounded dark:bg-red-900/30 dark:text-red-300">
              {error.original}
            </span>
          </Tooltip>
        );

        // Move past this error
        lastIndex = originalIndex + error.original.length;
      }
    });

    // Add any remaining text after the last error
    if (lastIndex < originalText.length) {
      parts.push(
        <span key="after-all">
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  const renderCorrectedText = () => {
    if (!errors || errors.length === 0) {
      return <span>{correctedText}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort errors by their position in the corrected text
    const sortedErrors = [...errors].sort((a, b) => {
      const aIndex = correctedText.indexOf(a.corrected);
      const bIndex = correctedText.indexOf(b.corrected);
      return aIndex - bIndex;
    });

    sortedErrors.forEach((error, i) => {
      const correctedIndex = correctedText.indexOf(error.corrected, lastIndex);
      
      if (correctedIndex !== -1) {
        // Add text before this correction
        if (correctedIndex > lastIndex) {
          parts.push(
            <span key={`before-${i}`}>
              {correctedText.slice(lastIndex, correctedIndex)}
            </span>
          );
        }

        // Add the corrected text with green background and underline
        parts.push(
          <Tooltip
            key={`correction-${i}`}
            content={`Corrected from: "${error.original}" - ${error.explanation}`}
            position="top"
          >
            <span className="bg-green-100 text-green-800 font-medium underline decoration-2 px-1 rounded dark:bg-green-900/30 dark:text-green-300">
              {error.corrected}
            </span>
          </Tooltip>
        );

        // Move past this correction
        lastIndex = correctedIndex + error.corrected.length;
      }
    });

    // Add any remaining text after the last correction
    if (lastIndex < correctedText.length) {
      parts.push(
        <span key="after-all">
          {correctedText.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  const renderPlainText = () => {
    return <span>{correctedText}</span>;
  };

  const renderInlineComparison = () => {
    if (!errors || errors.length === 0) {
      return <span>{correctedText}</span>;
    }

    const parts: React.ReactNode[] = [];
    let originalIndex = 0;
    let correctedIndex = 0;

    // Sort errors by their position in the original text
    const sortedErrors = [...errors].sort((a, b) => {
      const aIndex = originalText.indexOf(a.original);
      const bIndex = originalText.indexOf(b.original);
      return aIndex - bIndex;
    });

    sortedErrors.forEach((error, i) => {
      const errorOriginalIndex = originalText.indexOf(error.original, originalIndex);
      const errorCorrectedIndex = correctedText.indexOf(error.corrected, correctedIndex);
      
      if (errorOriginalIndex !== -1 && errorCorrectedIndex !== -1) {
        // Add text before this error/correction
        const beforeOriginal = originalText.slice(originalIndex, errorOriginalIndex);
        if (beforeOriginal) {
          parts.push(
            <span key={`before-${i}`}>
              {beforeOriginal}
            </span>
          );
        }

        // Add the inline comparison: original → corrected
        parts.push(
          <span key={`comparison-${i}`} className="inline-flex items-center gap-1">
            <span className="bg-red-100 text-red-800 line-through px-1 rounded text-sm dark:bg-red-900/30 dark:text-red-300">
              {error.original}
            </span>
            <span className="text-gray-500 dark:text-gray-400">→</span>
            <span className="bg-green-100 text-green-800 font-medium px-1 rounded text-sm dark:bg-green-900/30 dark:text-green-300">
              {error.corrected}
            </span>
          </span>
        );

        // Move past this error/correction
        originalIndex = errorOriginalIndex + error.original.length;
        correctedIndex = errorCorrectedIndex + error.corrected.length;
      }
    });

    // Add any remaining text after the last error
    if (originalIndex < originalText.length) {
      parts.push(
        <span key="after-all">
          {originalText.slice(originalIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Corrected Text</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHighlighting(!showHighlighting)}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title={showHighlighting ? "Show plain text" : "Show highlighted text"}
            aria-label={showHighlighting ? "Show plain text" : "Show highlighted text"}
          >
            {showHighlighting ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowComparison(false)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              !showComparison
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Final
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showComparison
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Compare
          </button>
        </div>
      </div>

      {!showComparison ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {showHighlighting ? renderCorrectedText() : renderPlainText()}
          </p>
          {errors && errors.length > 0 && showHighlighting && (
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
              <p className="text-sm text-green-700 dark:text-green-300">
                <span className="inline-block w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded mr-2"></span>
                Corrections are highlighted and underlined. Hover for details.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Original (with errors)</h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {renderOriginalWithErrors()}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Corrected</h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {renderCorrectedText()}
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800/50 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Inline Changes</h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {renderInlineComparison()}
            </p>
          </div>

          <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></span>
              <span>Errors (strikethrough)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></span>
              <span>Corrections (underlined)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}