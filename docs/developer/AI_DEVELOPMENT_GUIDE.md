# AI Development Guide for Grammar Correction Application

This document serves as a comprehensive guide for AI assistants when implementing new functionality or updates to the Grammar Correction web application.

## Project Overview

The Grammar Correction Tool is a Next.js/TypeScript application that leverages OpenRouter's LLM API to analyze text for grammar errors and provide intelligent corrections.

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **API Integration**: OpenRouter API
- **Persistence**: localStorage

## Project Structure

```
/playground/grammarcheck/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/             # API routes
│   │   ├── page.tsx         # Main page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   ├── lib/                 # Business logic and utilities
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── docs/                    # Documentation files
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── next.config.ts           # Next.js configuration
```

## Key Components and Their Responsibilities

### 1. API Layer (`src/app/api/grammar-check/route.ts`)
- Handles grammar checking requests
- Communicates with OpenRouter API
- Validates input and processes responses
- Returns structured JSON responses

### 2. Business Logic (`src/lib/`)
- `openrouter.ts`: OpenRouter API client
- `localStorage.ts`: History management utilities
- `types.ts`: TypeScript interfaces and types

### 3. UI Components (`src/components/`)
- `TextInput.tsx`: Text input area with character counter and keyboard shortcuts
- `LanguageSelector.tsx`: Dropdown for language selection
- `CorrectionDisplay.tsx`: Shows corrected text
- `ErrorTable.tsx`: Displays grammar errors in a table
- `HistoryPanel.tsx`: Manages correction history with export functionality

### 4. Main Page (`src/app/page.tsx`)
- Integrates all components
- Manages application state
- Handles user interactions
- Manages history updates and language preferences

## Development Guidelines

### Code Style and Conventions
1. Use TypeScript for all new code
2. Follow functional component patterns with React Hooks
3. Use Tailwind CSS for styling (mobile-first approach)
4. Maintain consistent naming conventions:
   - Components: PascalCase (`TextInput.tsx`)
   - Utilities: camelCase (`openrouter.ts`)
   - Constants: UPPER_SNAKE_CASE (`MAX_HISTORY_ITEMS`)

### State Management
1. Use `useState` for component-level state
2. Use `useEffect` for side effects
3. Keep state as localized as possible
4. Use functional updates when state depends on previous state
5. Pass state down through props rather than managing it in child components

### API Integration
1. Always handle loading states
2. Implement proper error handling
3. Validate all API responses
4. Use environment variables for API keys
5. Follow the existing pattern in `openrouter.ts` for new API integrations

### Data Persistence
1. Use `localStorage` for client-side storage
2. Follow the pattern in `localStorage.ts` for new persistence features
3. Implement data size limits to prevent storage overflow
4. Handle `localStorage` unavailability gracefully
5. Separate different types of data into different storage keys

## Adding New Features

### 1. New UI Component
1. Create a new file in `src/components/`
2. Use TypeScript interfaces for props
3. Implement mobile-first responsive design with Tailwind
4. Add the component to `src/app/page.tsx`
5. Pass required state and handlers as props

### 2. New API Endpoint
1. Create a new file in `src/app/api/` following the directory structure
2. Use the Edge Runtime (`export const runtime = 'edge';`)
3. Implement proper error handling and validation
4. Update `src/lib/types.ts` with new interfaces if needed

### 3. New Business Logic
1. Add new utilities to `src/lib/`
2. Export functions/classes for reuse
3. Include proper TypeScript typing
4. Add error handling where appropriate

### 4. New Data Structure
1. Update `src/lib/types.ts` with new interfaces
2. Modify localStorage utilities if needed
3. Update affected components and pages

## Testing Requirements (TDD)

All new features must follow Test-Driven Development principles:

### 1. Write Tests First
- Create test files before implementing functionality
- Place tests in `__tests__` directories next to the code being tested
- Write tests that describe the desired behavior

### 2. Test Categories
- **Unit Tests**: Test individual functions and utilities
- **Component Tests**: Test React components with different props and user interactions
- **Integration Tests**: Test how components work together
- **API Tests**: Test API routes with various inputs

### 3. Test File Structure
```
src/
├── components/
│   ├── TextInput.tsx
│   └── __tests__/
│       └── TextInput.test.tsx
├── lib/
│   ├── openrouter.ts
│   └── __tests__/
│       └── openrouter.test.ts
```

### 4. Test Examples

#### Unit Test Example
```typescript
// src/lib/__tests__/textUtils.test.ts
import { getWordCount } from '../textUtils';

describe('getWordCount', () => {
  it('should count words in a simple sentence', () => {
    expect(getWordCount('Hello world')).toBe(2);
  });
});
```

#### Component Test Example
```typescript
// src/components/__tests__/TextInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TextInput from '../TextInput';

describe('TextInput', () => {
  it('should call onTextChange when text is entered', () => {
    const mockOnChange = jest.fn();
    render(<TextInput {...props} onTextChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New text');
  });
});
```

### 5. Running Tests
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

For more detailed testing information, see the [Test Plan](TEST_PLAN.md) and [TDD Guide](TDD_GUIDE.md).

## Common Patterns and Best Practices

### Error Handling
```typescript
try {
  // API call or operation
} catch (error: unknown) {
  // Handle specific errors
  setError(error instanceof Error ? error.message : 'An unexpected error occurred');
}
```

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    // Perform action
  } finally {
    setIsLoading(false);
  }
};
```

### Environment Variables
```typescript
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error('API key is required');
}

const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';
```

### Keyboard Shortcuts
When adding keyboard shortcuts to components:
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    // Handle Ctrl+Enter
  }
};
```

### Data Flow
1. State is managed in the main `page.tsx` component
2. State is passed down to child components via props
3. Child components call handler functions to update state
4. History updates are handled by calling utility functions and updating state

## Testing Considerations

1. Test responsive design on various screen sizes
2. Verify API error handling
3. Check localStorage functionality
4. Validate input validation
5. Test cross-browser compatibility
6. Test keyboard shortcuts
7. Verify history updates happen immediately after corrections

## Deployment Checklist

1. Update environment variables
2. Verify API keys are properly secured
3. Test build process
4. Check mobile responsiveness
5. Validate all external API integrations
6. Test localStorage functionality
7. Verify keyboard shortcuts work
8. Run all tests and ensure they pass

## Environment Variables

The application uses the following environment variables:

- `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
- `NEXTJS_URL` - The URL where your application is hosted (required for API referer)
- `OPENROUTER_MODEL` - The OpenRouter model to use (optional, defaults to `mistralai/mistral-7b-instruct:free`)

## Troubleshooting Common Issues

### API Errors
1. Check API key configuration
2. Verify environment variables
3. Review OpenRouter API documentation
4. Check rate limiting

### Build Issues
1. Verify TypeScript compilation
2. Check Tailwind CSS configuration
3. Validate Next.js configuration
4. Ensure all dependencies are installed

### Performance Issues
1. Optimize API calls with caching
2. Minimize localStorage usage
3. Implement code splitting where appropriate
4. Optimize images and assets

### Hydration Errors
1. Use 'use client' directive for components that use localStorage or browser APIs
2. Initialize state without browser-specific values
3. Use useEffect for client-side only operations

## Recent Improvements

1. **Immediate History Updates**: History now updates immediately after corrections rather than on page refresh
2. **Persistent Language Preferences**: Language selections are saved and restored between sessions
3. **Keyboard Shortcuts**: Added Ctrl+Enter support for submitting text
4. **Export Functionality**: Users can now export their history as JSON
5. **Improved State Management**: Centralized state management in the main page component
6. **Configurable Model**: OpenRouter model can now be configured via environment variable

## Future Enhancement Opportunities

1. Real-time grammar checking
2. Export functionality (PDF, Word)
3. User accounts and cloud storage
4. Advanced analytics
5. Browser extension
6. Offline functionality
7. Additional language support
8. Custom grammar rules
9. Dark mode toggle
10. Text statistics (word count, reading time, etc.)

This guide should be updated as the application evolves to ensure consistency in development practices and code quality.

For more information about the project, see the other documentation files:
- [User Guide](USER_GUIDE.md) - Instructions for using the application
- [Technical Documentation](TECHNICAL_DOCS.md) - In-depth technical information
- [Test Plan](TEST_PLAN.md) - Comprehensive testing strategy
- [TDD Guide](TDD_GUIDE.md) - Test-Driven Development approach