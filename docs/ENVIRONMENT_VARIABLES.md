# Environment Variable Configuration

This document explains how to configure environment variables for the Grammar Correction Tool project.

## Environment Files

### .env.example
Located in the project root, this file serves as a template for environment variables:
```
# Environment variables for Grammar Correction Tool

# OpenRouter API Key (required)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Application URL
NEXTJS_URL=http://localhost:3000

# OpenRouter Model (optional)
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

### .env
For local development, copy `.env.example` to `.env` and update with your actual values:
```
# Environment variables for Grammar Correction Tool
# Copy this file to .env and update with your values

# OpenRouter API Key (required)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application URL
NEXTJS_URL=http://localhost:3000

# OpenRouter Model (optional)
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

## Required Environment Variables

### OPENROUTER_API_KEY
- **Purpose**: Authentication for OpenRouter API
- **Required**: Yes
- **How to get**: Sign up at [openrouter.ai](https://openrouter.ai) and generate an API key
- **Format**: `sk-or-v1-` followed by alphanumeric characters

### NEXTJS_URL
- **Purpose**: Referer header for OpenRouter API requests
- **Required**: Yes
- **Default**: `http://localhost:3000`
- **Production**: Should match your deployed URL

## Optional Environment Variables

### OPENROUTER_MODEL
- **Purpose**: Specify which OpenRouter model to use for grammar checking
- **Required**: No
- **Default**: `mistralai/mistral-7b-instruct:free`
- **Options**: Any model supported by OpenRouter

## Configuration Methods

### Development (Local)
1. Copy `.env.example` to `.env`
2. Update values in `.env` with your actual credentials
3. The application will automatically load these values

### Docker
Environment variables can be passed to Docker in several ways:

1. **Using -e flag**:
   ```bash
   docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key_here grammar-check
   ```

2. **Using env_file**:
   ```bash
   docker run -p 3000:3000 --env-file .env grammar-check
   ```

3. **Using Docker Compose** (recommended):
   ```bash
   cp .env.example .env
   # Edit .env with your values
   docker-compose up
   ```

### Production Deployment
Set environment variables according to your deployment platform:

#### Vercel
- Go to your project settings
- Navigate to Environment Variables
- Add each variable with its value

#### Heroku
- Use the Heroku CLI:
  ```bash
  heroku config:set OPENROUTER_API_KEY=your_key_here
  heroku config:set NEXTJS_URL=https://your-app.herokuapp.com
  ```

#### AWS Elastic Beanstalk
- Create a `.env` file in your application bundle
- Or set variables in the EB console under Configuration > Software

#### Google Cloud Run
- Use the gcloud CLI:
  ```bash
  gcloud run deploy --set-env-vars OPENROUTER_API_KEY=your_key_here,NEXTJS_URL=https://your-service.run.app
  ```

## Security Best Practices

1. **Never commit .env files** - Add `.env` to `.gitignore`
2. **Use strong API keys** - Rotate keys regularly
3. **Limit API key scopes** - Use keys with minimal required permissions
4. **Environment-specific keys** - Use different keys for development, staging, and production
5. **Secret management** - For production, consider using a secret management service

## Docker Configuration

### docker-compose.yml
The Docker Compose file is configured to:
1. Load environment variables from the `.env` file
2. Set default values for optional variables
3. Pass environment variables to the container

### Dockerfile
The Dockerfile:
1. Installs dependencies with `--legacy-peer-deps` to avoid React version conflicts
2. Builds the Next.js application
3. Exposes port 3000

## Troubleshooting

### Missing API Key
**Error**: "OpenRouter API key is not configured"
**Solution**: Ensure `OPENROUTER_API_KEY` is set in your environment

### Incorrect API Key
**Error**: "401 Unauthorized" from OpenRouter API
**Solution**: Verify your API key is correct and active

### Model Not Found
**Error**: "Model not found" from OpenRouter API
**Solution**: Check that the model name in `OPENROUTER_MODEL` is supported by OpenRouter

### Environment Variables Not Loaded
**Issue**: Variables not being read by the application
**Solution**: 
1. Verify the `.env` file is in the correct location (project root)
2. Check that variable names match exactly (case-sensitive)
3. Restart the application after updating variables

## Default Values

If environment variables are not set, the application will use these defaults:

| Variable | Default Value |
|----------|---------------|
| NEXTJS_URL | http://localhost:3000 |
| OPENROUTER_MODEL | mistralai/mistral-7b-instruct:free |

Note: `OPENROUTER_API_KEY` has no default and must be provided.