# Grammar Correction Tool - User Guide

## Introduction

The Grammar Correction Tool is a web application that helps you identify and correct grammar errors in your text. Powered by advanced language models through OpenRouter's API, it provides intelligent suggestions and detailed explanations for grammar mistakes.

## Getting Started

### Prerequisites

To run this application locally, you'll need:
- Node.js (version 18 or higher)
- npm or yarn package manager
- An OpenRouter API key (free to obtain at [openrouter.ai](https://openrouter.ai))

### Installation

1. Clone or download the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your API key:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   NEXTJS_URL=http://localhost:3000
   OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000`

## Using the Application

### Text Input

1. Type or paste your text into the large text area
2. The character counter helps you monitor text length (maximum 2000 characters)
3. Use the "Clear" button (X icon) to reset the input field
4. Press **Ctrl+Enter** as a shortcut to submit your text

### Language Selection

- **Input Language**: Select the language of your text from the dropdown
- **Explanation Language**: Choose the language for error explanations
- Common languages are available, including English, Spanish, French, German, and more
- Language preferences are saved between sessions

### Grammar Checking

1. Click the "Check Grammar" button or press **Ctrl+Enter**
2. The application will process your text and display:
   - Corrected version of your text
   - Detailed table of identified errors with explanations
3. Loading indicators show when processing is in progress

### Understanding Results

#### Corrected Text Section
- Shows the fully corrected version of your input text
- Displays in a highlighted green box for easy identification

#### Error Analysis Table
The table provides detailed information about each identified error:
- **Original**: The problematic text excerpt
- **Correction**: The suggested correction
- **Error Type**: Category of grammar error (e.g., subject-verb agreement)
- **Explanation**: Detailed description of why it's an error

### History Management

The History panel allows you to:
- View previous corrections with timestamps
- Restore previous texts for re-analysis
- Delete individual history items
- Clear all history with one click
- Toggle history visibility with the "Show/Hide" button
- Export history as JSON for backup or sharing

History is stored locally in your browser and persists between sessions. Language preferences are also saved.

## Technical Documentation

For developers and technical users who want to understand or extend the application, see our [Technical Documentation](TECHNICAL_DOCS.md).

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

### API Integration

The application communicates with OpenRouter's API through:
1. Client-side requests to `/api/grammar-check`
2. Server-side proxy that forwards requests to OpenRouter
3. Structured JSON responses for consistent parsing

### Extending Functionality

#### Adding New Languages
1. Update the language arrays in `page.tsx`
2. Modify the prompt in `openrouter.ts` if needed for specific language handling

#### Customizing Error Display
1. Modify `ErrorTable.tsx` to change how errors are presented
2. Add new columns or formatting as needed

#### Enhancing History Features
1. Update `HistoryPanel.tsx` for new history management features
2. Modify `localStorage.ts` for additional storage functionality

## Environment Variables

The application uses the following environment variables:

- `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
- `NEXTJS_URL` - The URL where your application is hosted (required for API referer)
- `OPENROUTER_MODEL` - The OpenRouter model to use (optional, defaults to `mistralai/mistral-7b-instruct:free`)

## Deployment

### Environment Variables

For deployment, ensure these environment variables are set:
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `NEXTJS_URL`: The URL where your application will be hosted
- `OPENROUTER_MODEL`: The OpenRouter model to use (optional)

### Building for Production

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

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your OpenRouter API key is correctly set in environment variables
2. **Loading Indefinitely**: Check browser console for network errors
3. **Empty Results**: Verify your text contains content and is in the selected language
4. **History Not Persisting**: Check browser storage settings and permissions

### Browser Compatibility

The application works best on modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Considerations

- Text processing time depends on length and complexity
- History is limited to 50 items to maintain performance
- Large texts may take longer to process

## Contributing

We welcome contributions to improve the Grammar Correction Tool:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

For developers working on the project, see our [AI Development Guide](AI_DEVELOPMENT_GUIDE.md) for coding standards and best practices.

## Support

For issues, questions, or suggestions:
1. Check the GitHub issues page
2. Submit a new issue with detailed information
3. Include browser information and steps to reproduce issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.