import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LanguageSelector from '../LanguageSelector';

describe('LanguageSelector', () => {
  const mockLanguages = [
    { code: 'English', name: 'English' },
    { code: 'Spanish', name: 'Spanish' },
    { code: 'French', name: 'French' },
  ];

  it('should render with the correct label', () => {
    render(
      <LanguageSelector
        label="Test Label"
        value="English"
        onChange={jest.fn()}
        languages={mockLanguages}
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render all language options', () => {
    render(
      <LanguageSelector
        label="Test Label"
        value="English"
        onChange={jest.fn()}
        languages={mockLanguages}
      />
    );

    mockLanguages.forEach(lang => {
      expect(screen.getByText(lang.name)).toBeInTheDocument();
    });
  });

  it('should call onChange when a language is selected', () => {
    const mockOnChange = jest.fn();
    
    render(
      <LanguageSelector
        label="Test Label"
        value="English"
        onChange={mockOnChange}
        languages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Spanish' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Spanish');
  });

  it('should have the correct selected value', () => {
    render(
      <LanguageSelector
        label="Test Label"
        value="French"
        onChange={jest.fn()}
        languages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('French');
  });
});