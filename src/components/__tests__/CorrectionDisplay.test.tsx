import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CorrectionDisplay from '../CorrectionDisplay';
import { GrammarError } from '@/lib/types';

describe('CorrectionDisplay', () => {
  it('should not render when correctedText is empty', () => {
    render(<CorrectionDisplay originalText="" correctedText="" errors={[]} />);
    
    expect(screen.queryByText('Corrected Text')).not.toBeInTheDocument();
  });

  it('should render the corrected text and highlight changes, even with multiple errors', () => {
    const originalText =  "Guten Tag Frau Bostanci. Ich hoffe, dass Ihnen gut geht. Die Prüfung Ort ist an dieser Adresse. Es sieht komisch, weil es ein Stadtverwaltung ist. Bitte bestätigen Sie, ob diese Adresse ist richtig. Vielen Dank im Voraus.";
    const correctedText = "Guten Tag Frau Bostanci. Ich hoffe, dass Ihnen gut geht. Der Ort der Prüfung ist an dieser Adresse. Es sieht merkwürdig, weil es eine Stadtverwaltung ist. Bitte bestätigen Sie, ob diese Adresse richtig ist. Vielen Dank im Voraus.";
    const errors: GrammarError[] = [
      {
        original: "Die Prüfung Ort",
        corrected: "Der Ort der Prüfung",
        errorType: "word order",
        explanation: "In German, the correct word order is 'Ort der Prüfung', not 'Prüfung Ort'.",
        position: 58
      },
      {
        original: "Es sieht komisch",
        corrected: "Es sieht merkwürdig",
        errorType: "vocabulary",
        explanation: "The word 'komisch' means funny or strange, but not necessarily in a negative way. 'Merkwürdig' is a more neutral term for something that is strange or peculiar.",
        position: 95
      },
       {
        original: "ist richtig",
        corrected: "richtig ist",
        errorType: "word order",
        explanation: "In German, the verb should be at the end of the clause.",
        position: 178
      }
    ];

    render(<CorrectionDisplay originalText={originalText} correctedText={correctedText} errors={errors} />);
    
    expect(screen.getByText('Corrected Text')).toBeInTheDocument();
    
    const correctedSnippet1 = screen.getByText('Der Ort der Prüfung');
    expect(correctedSnippet1).toBeInTheDocument();
    expect(correctedSnippet1.tagName).toBe('SPAN');

    const correctedSnippet2 = screen.getByText('Es sieht merkwürdig');
    expect(correctedSnippet2).toBeInTheDocument();
    expect(correctedSnippet2.tagName).toBe('SPAN');

    const correctedSnippet3 = screen.getByText('richtig ist');
    expect(correctedSnippet3).toBeInTheDocument();
    expect(correctedSnippet3.tagName).toBe('SPAN');

    // Find the paragraph element by its class and check its full text content
    const paragraph = document.querySelector('p.text-gray-800');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toBe("Guten Tag Frau Bostanci. Ich hoffe, dass Ihnen gut geht. Der Ort der Prüfung ist an dieser Adresse. Es sieht merkwürdig, weil es eine Stadtverwaltung ist. Bitte bestätigen Sie, ob diese Adresse richtig ist. Vielen Dank im Voraus.");
  });

  it('should toggle between highlighted and plain text when icon button is clicked', () => {
    const originalText = "This is wrong text.";
    const correctedText = "This is correct text.";
    const errors: GrammarError[] = [
      {
        original: "wrong",
        corrected: "correct",
        errorType: "vocabulary",
        explanation: "Better word choice",
        position: 8
      }
    ];

    render(<CorrectionDisplay originalText={originalText} correctedText={correctedText} errors={errors} />);
    
    // Initially, highlighting should be enabled (default state)
    const highlightedText = screen.getByText('correct');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText.tagName).toBe('SPAN');
    expect(highlightedText).toHaveClass('bg-green-100');

    // Find the icon button by its aria-label
    const iconButton = screen.getByLabelText('Show plain text');
    expect(iconButton).toBeInTheDocument();

    // Click the icon button to toggle to plain text
    fireEvent.click(iconButton);

    // After clicking, the text should be plain (no highlighting)
    const paragraph = document.querySelector('p.text-gray-800');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toBe("This is correct text.");
    
    // The highlighted span should no longer exist with highlighting classes
    const plainCorrectText = screen.queryByText('correct');
    if (plainCorrectText) {
      expect(plainCorrectText).not.toHaveClass('bg-green-100');
    }

    // The button aria-label should change
    const toggledButton = screen.getByLabelText('Show highlighted text');
    expect(toggledButton).toBeInTheDocument();

    // Click again to toggle back to highlighted text
    fireEvent.click(toggledButton);

    // The highlighting should be back
    const highlightedTextAgain = screen.getByText('correct');
    expect(highlightedTextAgain).toBeInTheDocument();
    expect(highlightedTextAgain).toHaveClass('bg-green-100');
  });
});