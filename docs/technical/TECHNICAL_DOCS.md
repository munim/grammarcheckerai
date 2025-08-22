# Grammar Correction Tool - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Component Documentation](#component-documentation)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Data Persistence](#data-persistence)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Performance Optimization](#performance-optimization)
11. [Extending Functionality](#extending-functionality)

## Architecture Overview

The Grammar Correction Tool follows a client-server architecture using Next.js as the primary framework:

- **Frontend**: React components with TypeScript and Tailwind CSS for styling
- **Backend**: Next.js API routes that communicate with the OpenRouter API
- **State Management**: React Hooks for local component state
- **Data Persistence**: localStorage for client-side history storage and preferences
- **External API**: OpenRouter's LLM API for grammar analysis

The application is designed with a mobile-first approach and follows responsive design principles.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── grammar-check/ # Grammar checking endpoint
│   ├── page.tsx           # Main application page
│   └── layout.tsx         # Application layout
├── components/            # React UI components
├── lib/                   # Business logic and utilities
└── types/                 # TypeScript type definitions
```

## Component Documentation

### Main Page (`src/app/page.tsx`)

The main application page that integrates all components and manages the overall application state.

**Props**: None
**State**:
- `text`: User input text
- `inputLanguage`: Language of the input text
- `explanationLanguage`: Language for error explanations
- `correctedText`: Grammar-corrected version of the input
- `errors`: Array of identified grammar errors
- `isLoading`: Loading state during API requests
- `error`: Error messages
- `history`: Array of previous corrections

### TextInput (`src/components/TextInput.tsx`)

Provides a text area for user input with character counting, clear functionality, and keyboard shortcuts.

**Props**:
- `text`: Current text value
- `onTextChange`: Handler for text changes
- `onClear`: Handler for clearing the text
- `onSubmit`: Handler for submitting the text
- `isLoading`: Loading state

### LanguageSelector (`src/components/LanguageSelector.tsx`)

Dropdown component for selecting input and explanation languages.

**Props**:
- `label`: Label for the selector
- `value`: Current selected value
- `onChange`: Handler for value changes
- `languages`: Array of available languages

### CorrectionDisplay (`src/components/CorrectionDisplay.tsx`)

Displays the corrected version of the input text.

**Props**:
- `correctedText`: The corrected text to display

### ErrorTable (`src/components/ErrorTable.tsx`)

Displays identified grammar errors in a structured table format.

**Props**:
- `errors`: Array of grammar errors

### HistoryPanel (`src/components/HistoryPanel.tsx`)

Manages the history of previous corrections with restore, delete, clear, and export functionality.

**Props**:
- `history`: Array of previous corrections
- `onRestore`: Handler for restoring a previous correction
- `onDelete`: Handler for deleting a correction
- `onClearAll`: Handler for clearing all history

## API Integration

### OpenRouter Client (`src/lib/openrouter.ts`)

Handles communication with the OpenRouter API:

1. **Initialization**: Requires an API key
2. **Grammar Check**: Sends text and language preferences to the API
3. **Prompt Engineering**: Constructs prompts for optimal LLM responses
4. **Response Handling**: Processes API responses
5. **Model Configuration**: Uses model specified in environment variable or defaults to `mistralai/mistral-7b-instruct:free`

### API Route (`src/app/api/grammar-check/route.ts`)

Next.js API route that acts as a proxy between the frontend and OpenRouter:

1. **Input Validation**: Ensures required fields are present
2. **API Key Management**: Retrieves the API key from environment variables
3. **Error Handling**: Catches and formats API errors
4. **Response Formatting**: Ensures consistent JSON responses

## State Management

The application uses React's built-in state management:

- **Component-level state**: `useState` hooks for managing local component state
- **Derived state**: Computed values based on other state variables
- **State synchronization**: Coordinating state between components through props
- **Centralized state**: Main state is managed in the `Home` component and passed down to children

### State Flow

1. User enters text in `TextInput`
2. Text state is updated in the main `Home` component
3. On submission, text is sent to the API route
4. API response updates the `correctedText` and `errors` state
5. History is updated with the new correction
6. UI components re-render with new data

## Data Persistence

### localStorage Management (`src/lib/localStorage.ts`)

Handles client-side storage of correction history and language preferences:

- **History Storage**: Saves corrections with timestamps
- **History Retrieval**: Loads history on component mount
- **History Management**: Delete individual items or clear all
- **Size Limiting**: Maintains a maximum of 50 history items
- **Language Preferences**: Saves and retrieves language selections
- **Export Functionality**: History can be exported as JSON

### Data Structure

```typescript
interface GrammarCorrection {
  id: string;
  timestamp: Date;
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
  inputLanguage: string;
  explanationLanguage: string;
}
```

## Error Handling

### Client-Side Errors

1. **Network Errors**: Caught and displayed to the user
2. **API Errors**: Formatted and shown in error banners
3. **Validation Errors**: Prevent invalid submissions
4. **localStorage Errors**: Logged to console without breaking the UI

### Server-Side Errors

1. **Input Validation**: Returns 400 errors for invalid requests
2. **API Communication**: Handles OpenRouter API errors
3. **System Errors**: Returns 500 errors for unexpected issues

## Testing

For comprehensive testing information, see our [Test Plan](TEST_PLAN.md) and [TDD Guide](TDD_GUIDE.md).

### Unit Testing

Components and utilities should be tested individually:

1. **Component Rendering**: Ensure components render correctly with various props
2. **State Updates**: Verify state changes occur as expected
3. **Event Handling**: Test user interactions trigger correct actions
4. **API Integration**: Mock API calls to test success and failure scenarios

### Integration Testing

Test the complete flow of the application:

1. **Text Input to Correction**: Verify the full process from input to display
2. **History Management**: Test saving, restoring, and deleting history items
3. **Error States**: Ensure error handling works throughout the application

### End-to-End Testing

Test the application as a user would interact with it:

1. **Browser Compatibility**: Test across different browsers
2. **Responsive Design**: Verify mobile and desktop layouts
3. **Performance**: Measure load times and response speeds
4. **Keyboard Shortcuts**: Verify Ctrl+Enter functionality

## Deployment

### Environment Variables

Required environment variables:

- `OPENROUTER_API_KEY`: OpenRouter API key
- `NEXTJS_URL`: Application URL for API referer header
- `OPENROUTER_MODEL`: OpenRouter model to use (optional, defaults to `mistralai/mistral-7b-instruct:free`)

### Build Process

```bash
npm run build
npm start
```

### Docker Deployment

A Dockerfile is included for containerized deployment:

```bash
docker build -t grammar-check .
docker run -p 3000:3000 grammar-check
```

## Performance Optimization

### Code Splitting

Next.js automatically code-splits pages and components for optimal loading.

### API Caching

Consider implementing caching for common corrections to reduce API calls.

### Lazy Loading

Large components or features can be lazy-loaded to improve initial load time.

### Bundle Optimization

Regular analysis of bundle sizes to identify optimization opportunities.

## Extending Functionality

### Adding New Languages

1. Update language arrays in the `Home` component
2. Modify the OpenRouter prompt if needed for specific language handling

### Custom Error Categories

1. Extend the `GrammarError` interface in `types.ts`
2. Update the OpenRouter prompt to include new error types
3. Modify the `ErrorTable` component to display new fields

### Advanced History Features

1. Add search/filter functionality to `HistoryPanel`
2. Implement export options (PDF, CSV)
3. Add tagging or categorization of corrections

### Real-time Checking

1. Implement debounced API calls as the user types
2. Add visual indicators for real-time feedback
3. Consider performance implications of frequent API calls

### User Accounts

1. Add authentication layer
2. Implement server-side history storage
3. Add user preferences and settings

## Security Considerations

1. **API Key Protection**: Never expose API keys in client-side code
2. **Input Sanitization**: Validate and sanitize all user inputs
3. **Rate Limiting**: Implement client-side rate limiting to prevent abuse
4. **Error Information**: Avoid exposing sensitive system information in error messages

## Accessibility

The application follows WCAG guidelines:

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Reader Support**: Proper semantic HTML and ARIA attributes
3. **Color Contrast**: Sufficient contrast for text and interactive elements
4. **Focus Management**: Clear focus indicators for interactive elements

## Browser Support

The application supports modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

For older browsers, polyfills may be required for some JavaScript features.

## Recent Improvements

1. **Immediate History Updates**: History now updates immediately after corrections rather than on page refresh
2. **Persistent Language Preferences**: Language selections are saved and restored between sessions
3. **Keyboard Shortcuts**: Added Ctrl+Enter support for submitting text
4. **Export Functionality**: Users can now export their history as JSON
5. **Improved State Management**: Centralized state management in the main page component
6. **Hydration Error Fixes**: Resolved client-server mismatches that caused hydration errors
7. **Configurable Model**: OpenRouter model can now be configured via environment variable

For development guidelines and best practices, see our [AI Development Guide](AI_DEVELOPMENT_GUIDE.md).