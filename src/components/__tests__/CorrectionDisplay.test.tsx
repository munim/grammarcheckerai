import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CorrectionDisplay from '../CorrectionDisplay';

describe('CorrectionDisplay', () => {
  it('should not render when correctedText is empty', () => {
    render(<CorrectionDisplay correctedText="" />);
    
    expect(screen.queryByText('Corrected Text')).not.toBeInTheDocument();
  });

  it('should render the corrected text when provided', () => {
    const correctedText = 'This is the corrected text.';
    render(<CorrectionDisplay correctedText={correctedText} />);
    
    expect(screen.getByText('Corrected Text')).toBeInTheDocument();
    expect(screen.getByText(correctedText)).toBeInTheDocument();
  });
});