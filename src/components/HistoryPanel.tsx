'use client';

import React, { useState } from 'react';
import { GrammarCorrection } from '@/lib/types';

interface HistoryPanelProps {
  history: GrammarCorrection[];
  onRestore: (correction: GrammarCorrection) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryPanel({ history, onRestore, onDelete, onClearAll }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `grammar-corrections-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">History</h2>
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mr-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
          {history.length > 0 && (
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={handleExport}
                className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-l-md dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-200"
              >
                Export
              </button>
              <button
                onClick={onClearAll}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-r-md dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-200"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border border-gray-200 rounded-lg dark:border-gray-700">
          {history.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No history yet. Your corrections will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {history.map((item) => (
                <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                        {item.originalText.substring(0, 50)}{item.originalText.length > 50 ? '...' : ''}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.timestamp)} • {item.inputLanguage} → {item.explanationLanguage}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => onRestore(item)}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-200"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}