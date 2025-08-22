import React from 'react';

interface CorrectionDisplayProps {
  correctedText: string;
}

export default function CorrectionDisplay({ correctedText }: CorrectionDisplayProps) {
  if (!correctedText) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Corrected Text</h2>
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{correctedText}</p>
      </div>
    </div>
  );
}