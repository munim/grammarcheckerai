import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from '../Tooltip';

// Mock getBoundingClientRect for positioning tests
const mockGetBoundingClientRect = (rect: Partial<DOMRect>) => {
  return jest.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    top: 0,
    right: 100,
    bottom: 20,
    left: 0,
    ...rect,
  })) as jest.Mock;
};

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

describe('Tooltip', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('should render children without tooltip initially', () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
  });

  it('should show tooltip on mouse enter and hide on mouse leave', async () => {
    const triggerElement = document.createElement('div');
    const tooltipElement = document.createElement('div');
    
    triggerElement.getBoundingClientRect = mockGetBoundingClientRect({
      left: 100,
      top: 100,
      width: 50,
      height: 20,
    });
    
    tooltipElement.getBoundingClientRect = mockGetBoundingClientRect({
      width: 120,
      height: 30,
    });

    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');

    // Mouse enter should show tooltip
    fireEvent.mouseEnter(button);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    });

    // Mouse leave should hide tooltip
    fireEvent.mouseLeave(button);
    
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
    });
  });

  it('should render tooltip with correct default position (top)', async () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip content');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass('fixed', 'z-50');
    });
  });

  it('should render tooltip with custom position', async () => {
    render(
      <Tooltip content="Test tooltip content" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip content');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should apply custom className to trigger element', () => {
    render(
      <Tooltip content="Test tooltip content" className="custom-class">
        <button>Hover me</button>
      </Tooltip>
    );

    const triggerSpan = screen.getByText('Hover me').parentElement;
    expect(triggerSpan).toHaveClass('custom-class');
  });

  it('should render tooltip with dark mode styles', async () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip content');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass('dark:bg-gray-100', 'dark:text-gray-900');
    });
  });

  it('should render tooltip with arrow element', async () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip content');
      expect(tooltip).toBeInTheDocument();
      
      // Check for arrow element (it should be a sibling div with transform rotate-45)
      const arrow = tooltip.querySelector('div');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass('rotate-45');
    });
  });

  it('should handle long content with proper wrapping', async () => {
    const longContent = "This is a very long tooltip content that should wrap properly and not exceed the maximum width constraint";
    
    render(
      <Tooltip content={longContent}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      const tooltip = screen.getByText(longContent);
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass('max-w-xs', 'break-words');
    });
  });

  it('should not interfere with pointer events', async () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip content');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass('pointer-events-none');
    });
  });

  it('should handle different position values correctly', async () => {
    const positions: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];
    
    for (const position of positions) {
      const { unmount } = render(
        <Tooltip content="Test tooltip content" position={position}>
          <button>Hover me {position}</button>
        </Tooltip>
      );

      const button = screen.getByText(`Hover me ${position}`);
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        const tooltip = screen.getByText('Test tooltip content');
        expect(tooltip).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('should handle window resize events', async () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    });

    // Check that event listeners are added
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    fireEvent.mouseLeave(button);

    await waitFor(() => {
      expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
    });

    // Check that event listeners are removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});