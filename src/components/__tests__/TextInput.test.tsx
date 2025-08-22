import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextInput from '../TextInput';

// Mock the SVG icon
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  SVGProps: () => ({}),
}));

describe('TextInput', () => {
  const mockProps = {
    text: '',
    onTextChange: jest.fn(),
    onClear: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the text area with placeholder', () => {
    render(<TextInput {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Type or paste your text here... Press Ctrl+Enter to submit');
    expect(textarea).toBeInTheDocument();
  });

  it('should display the correct character count', () => {
    const text = 'Hello, world!';
    render(<TextInput {...mockProps} text={text} />);
    
    expect(screen.getByText(`${text.length}/2000`)).toBeInTheDocument();
  });

  it('should call onTextChange when text is entered', () => {
    render(<TextInput {...mockProps} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    expect(mockProps.onTextChange).toHaveBeenCalledWith('New text');
  });

  it('should call onClear when clear button is clicked', () => {
    render(<TextInput {...mockProps} text="Some text" />);
    
    const clearButton = screen.getByLabelText('Clear text');
    fireEvent.click(clearButton);
    
    expect(mockProps.onClear).toHaveBeenCalled();
  });

  it('should call onSubmit when submit button is clicked', () => {
    render(<TextInput {...mockProps} text="Some text" />);
    
    const submitButton = screen.getByText('Check Grammar');
    fireEvent.click(submitButton);
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('should disable submit button when text is empty', () => {
    render(<TextInput {...mockProps} text="" />);
    
    const submitButton = screen.getByText('Check Grammar');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when text is not empty', () => {
    render(<TextInput {...mockProps} text="Some text" />);
    
    const submitButton = screen.getByText('Check Grammar');
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state when isLoading is true', () => {
    render(<TextInput {...mockProps} text="Some text" isLoading={true} />);
    
    const submitButton = screen.getByText('Checking...');
    expect(submitButton).toBeInTheDocument();
  });

  it('should call onSubmit when Ctrl+Enter is pressed', () => {
    render(<TextInput {...mockProps} text="Some text" />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('should not call onSubmit when Enter is pressed without Ctrl', () => {
    render(<TextInput {...mockProps} text="Some text" />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });
});