import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorTable from '../ErrorTable';
import { GrammarError } from '../../types';

describe('ErrorTable', () => {
  const mockErrors: GrammarError[] = [
    {
      original: 'This is wrongs.',
      corrected: 'This is wrong.',
      errorType: 'Subject-Verb Agreement',
      explanation: 'The verb should agree with the subject in number.',
      position: 8
    },
    {
      original: "She don't like it.",
      corrected: "She doesn't like it.",
      errorType: 'Verb Conjugation',
      explanation: 'Third person singular requires "doesn\'t" instead of "don\'t".',
      position: 4
    }
  ];

  it('should not render when errors array is empty', () => {
    render(<ErrorTable errors={[]} />);
    
    expect(screen.queryByText('Grammar Issues Found')).not.toBeInTheDocument();
  });

  it('should not render when errors prop is null', () => {
    render(<ErrorTable errors={null as unknown as GrammarError[]} />);
    
    expect(screen.queryByText('Grammar Issues Found')).not.toBeInTheDocument();
  });

  it('should render the error table with correct headers', () => {
    render(<ErrorTable errors={mockErrors} />);
    
    expect(screen.getByText('Grammar Issues Found')).toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Correction')).toBeInTheDocument();
    expect(screen.getByText('Error Type')).toBeInTheDocument();
    expect(screen.getByText('Explanation')).toBeInTheDocument();
  });

  it('should render all error rows', () => {
    render(<ErrorTable errors={mockErrors} />);
    
    mockErrors.forEach(error => {
      expect(screen.getByText(error.original)).toBeInTheDocument();
      expect(screen.getByText(error.corrected)).toBeInTheDocument();
      expect(screen.getByText(error.errorType)).toBeInTheDocument();
      expect(screen.getByText(error.explanation)).toBeInTheDocument();
    });
  });

  it('should apply correct styling to corrected text', () => {
    render(<ErrorTable errors={mockErrors} />);
    
    const correctedElement = screen.getByText('This is wrong.');
    expect(correctedElement).toHaveClass('text-green-600');
  });
});