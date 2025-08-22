# Test-Driven Development (TDD) Guide for Grammar Correction Tool

This guide outlines the Test-Driven Development process for adding new features to the Grammar Correction Tool. Following this approach ensures code quality, maintainability, and proper test coverage.

## TDD Process Overview

1. **Write a failing test** - Create a test that defines the desired behavior
2. **Write minimal code** - Implement just enough code to make the test pass
3. **Refactor** - Improve the code while keeping tests passing
4. **Repeat** - Continue the cycle for each new feature or enhancement

## Steps for Adding New Features

### 1. Identify the Feature Requirements

Before writing any code, clearly define what the new feature should do:
- What user problem does it solve?
- What are the inputs and expected outputs?
- What are the edge cases?
- How should it integrate with existing functionality?

### 2. Write Tests First

#### For Utility Functions (src/lib/)
1. Create a test file in `src/lib/__tests__/`
2. Write unit tests covering:
   - Normal use cases
   - Edge cases
   - Error conditions
   - Boundary conditions

#### For Components (src/components/)
1. Create a test file in `src/components/__tests__/`
2. Write tests covering:
   - Rendering with different props
   - User interactions
   - State changes
   - Conditional rendering

#### For API Routes (src/app/api/)
1. Create a test file in `src/app/api/[route]/__tests__/`
2. Write tests covering:
   - Valid requests
   - Invalid requests
   - Error responses
   - Security considerations

### 3. Example: Adding a Word Count Feature

Let's walk through adding a word count feature using TDD.

#### Step 1: Write the Test

Create `src/lib/__tests__/textUtils.test.ts`:

```typescript
import { getWordCount } from '../textUtils';

describe('getWordCount', () => {
  it('should count words in a simple sentence', () => {
    expect(getWordCount('Hello world')).toBe(2);
  });

  it('should handle empty text', () => {
    expect(getWordCount('')).toBe(0);
  });

  it('should handle multiple spaces', () => {
    expect(getWordCount('Hello    world')).toBe(2);
  });

  it('should handle punctuation', () => {
    expect(getWordCount('Hello, world!')).toBe(2);
  });

  it('should handle newlines', () => {
    expect(getWordCount('Hello\nworld')).toBe(2);
  });
});
```

#### Step 2: Write Minimal Implementation

Create `src/lib/textUtils.ts`:

```typescript
export function getWordCount(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}
```

#### Step 3: Run Tests and Refine

Run the tests and verify they pass:

```bash
npm run test src/lib/__tests__/textUtils.test.ts
```

#### Step 4: Refactor if Needed

Improve the implementation while keeping tests passing:

```typescript
export function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
```

#### Step 5: Integrate with UI

Create tests for the component that will display the word count:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WordCountDisplay from '../WordCountDisplay';

describe('WordCountDisplay', () => {
  it('should display the correct word count', () => {
    render(<WordCountDisplay text="Hello world" />);
    expect(screen.getByText('Words: 2')).toBeInTheDocument();
  });

  it('should display zero for empty text', () => {
    render(<WordCountDisplay text="" />);
    expect(screen.getByText('Words: 0')).toBeInTheDocument();
  });
});
```

Then implement the component:

```typescript
import React from 'react';
import { getWordCount } from '@/lib/textUtils';

interface WordCountDisplayProps {
  text: string;
}

export default function WordCountDisplay({ text }: WordCountDisplayProps) {
  const wordCount = getWordCount(text);
  return <div className="text-sm text-gray-500">Words: {wordCount}</div>;
}
```

### 4. Test Categories

#### Unit Tests
- Test individual functions and utilities in isolation
- Mock external dependencies
- Focus on logic and edge cases
- Fast execution

#### Integration Tests
- Test how components work together
- Test API routes with mocked services
- Verify data flow between components
- Test state management

#### End-to-End Tests
- Test complete user workflows
- Test browser compatibility
- Test responsive design
- Test accessibility

### 5. Test Structure Guidelines

#### AAA Pattern (Arrange, Act, Assert)
```typescript
it('should handle API errors gracefully', () => {
  // Arrange
  const mockError = new Error('API Error');
  jest.spyOn(api, 'fetchData').mockRejectedValue(mockError);
  
  // Act
  const result = callFunction();
  
  // Assert
  expect(result).rejects.toThrow('API Error');
});
```

#### Descriptive Test Names
```typescript
// Good
it('should return 0 when text is empty', () => { ... });

// Better
it('should return zero word count for empty text input', () => { ... });
```

#### One Assertion Per Test
```typescript
// Avoid
it('should validate email correctly', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid-email')).toBe(false);
});

// Prefer
it('should return true for valid email addresses', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});

it('should return false for invalid email addresses', () => {
  expect(validateEmail('invalid-email')).toBe(false);
});
```

### 6. Mocking Strategies

#### Mocking External APIs
```typescript
// Mock fetch
global.fetch = jest.fn();

// Mock module
jest.mock('@/lib/openrouter', () => ({
  OpenRouterClient: jest.fn().mockImplementation(() => ({
    checkGrammar: jest.fn().mockResolvedValue({ ... })
  }))
}));
```

#### Mocking localStorage
```typescript
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});
```

### 7. Continuous Integration

#### Test Execution
- Run tests on every pull request
- Run tests on deployment
- Monitor test coverage
- Fail builds on test failures

#### Coverage Requirements
- Unit tests: 80% coverage
- Component tests: 90% of components
- Integration tests: 70% of user flows

### 8. Best Practices

#### Test Data
- Use realistic test data
- Create fixtures for common scenarios
- Parameterize tests for similar cases
- Avoid brittle tests that break with implementation changes

#### Test Maintenance
- Review tests when refactoring
- Remove obsolete tests
- Update tests when requirements change
- Keep tests DRY (Don't Repeat Yourself)

#### Performance
- Keep tests fast
- Use focused tests for development
- Parallelize test execution
- Avoid unnecessary setup/teardown

## Recent Improvements to Testing Framework

### Model Configuration Testing
We've added specific tests for the model configuration feature:

1. **Environment Variable Testing** - Verifies that the model is correctly read from environment variables
2. **Default Model Testing** - Ensures the default model is used when no environment variable is set
3. **API Request Testing** - Confirms that the correct model is sent in API requests
4. **Backward Compatibility Testing** - Validates that existing functionality remains unchanged

These tests can be found in `src/lib/__tests__/openrouter.model.test.ts`.

## Conclusion

Following this TDD approach ensures that new features are:
1. Well-tested from the start
2. Designed with clear interfaces
3. Integrated smoothly with existing code
4. Maintainable and refactorable

When adding new functionality, always start with writing tests that describe the desired behavior, then implement the minimal code to make those tests pass, and finally refactor for quality while keeping all tests green.