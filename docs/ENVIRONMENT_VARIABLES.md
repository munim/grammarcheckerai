# Environment Variable Configuration

This document explains how to configure environment variables for the Grammar Correction Tool project.

## Overview

The application supports **three LLM providers**, selectable at runtime via the `ACTIVE_PROVIDER` env var:

| `ACTIVE_PROVIDER` | Required env vars                                | Notes                                                     |
|-------------------|--------------------------------------------------|-----------------------------------------------------------|
| `openrouter` (default) | `OPENROUTER_API_KEY`                          | Backward-compatible default — existing deployments keep working. |
| `nvidia`          | `NVIDIA_API_KEY`                                 | Uses NVIDIA NIM hosted endpoint (build.nvidia.com).       |
| `custom`          | `CUSTOM_BASE_URL`, `CUSTOM_API_KEY`               | Any OpenAI Chat Completions-compatible endpoint.          |

You only need to configure credentials for **the one provider you pick**.

## Environment Files

### .env.example
Located in the project root, this file serves as a template for environment variables and ships commented samples for each provider:
```
# Pick the active LLM provider
# ACTIVE_PROVIDER=openrouter   # default if unset

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXTJS_URL=http://localhost:3000
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free

# NVIDIA NIM
# NVIDIA_API_KEY=nvapi-your_key_here
# NVIDIA_MODEL=meta/llama-3.1-70b-instruct
# NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1   # optional override

# Custom OpenAI-compatible endpoint
# CUSTOM_BASE_URL=https://your-endpoint.example.com/v1
# CUSTOM_API_KEY=your_key_for_that_endpoint
# CUSTOM_MODEL=gpt-3.5-turbo
```

### .env
For local development, copy `.env.example` to `.env` and update with your actual values for the provider you intend to use.

## Provider Selection

### ACTIVE_PROVIDER
- **Purpose**: Selects which LLM provider the server uses for grammar checks.
- **Required**: No
- **Default**: `openrouter`
- **Allowed values**: `openrouter`, `nvidia`, `custom` (case-insensitive)
- **Behavior**: Read on every request, so edits to the env var take effect without rebuild when paired with hot-reload.

## OpenRouter (when `ACTIVE_PROVIDER=openrouter`)

### OPENROUTER_API_KEY
- **Required**: Yes (for OpenRouter)
- **Format**: `sk-or-v1-…`
- **Get one**: [openrouter.ai](https://openrouter.ai)

### NEXTJS_URL
- **Purpose**: Sent as the `HTTP-Referer` header that OpenRouter requires for attribution.
- **Required**: Yes (for OpenRouter)
- **Default**: `http://localhost:3000`

### OPENROUTER_MODEL
- **Required**: No
- **Default**: `mistralai/mistral-7b-instruct:free`
- **Any OpenRouter model id works.**

## NVIDIA NIM (when `ACTIVE_PROVIDER=nvidia`)

### NVIDIA_API_KEY
- **Required**: Yes (for NVIDIA)
- **Get one**: [build.nvidia.com](https://build.nvidia.com) → "Get API Key"

### NVIDIA_MODEL
- **Required**: No
- **Default**: `meta/llama-3.1-70b-instruct`
- Common alternatives: `meta/llama-3.1-8b-instruct`, `mistralai/mistral-large`, `google/gemma-2-9b-it`.

### NVIDIA_BASE_URL
- **Required**: No
- **Default**: `https://integrate.api.nvidia.com/v1`
- Override only when using a self-hosted NIM or a private endpoint.

## Custom OpenAI-compatible Endpoint (when `ACTIVE_PROVIDER=custom`)

### CUSTOM_BASE_URL
- **Purpose**: Chat-completions base URL of the endpoint (e.g. `http://localhost:11434/v1` for Ollama's OpenAI listener).
- **Required**: Yes (for custom)
- Trailing slashes are stripped automatically.

### CUSTOM_API_KEY
- **Required**: Yes (for custom)
- Sent as `Authorization: Bearer <CUSTOM_API_KEY>`.

### CUSTOM_MODEL
- **Required**: No
- **Default**: `gpt-3.5-turbo`
- **Override**: Set `CUSTOM_MODEL` (or pass `model` at runtime in the future) when targeting a non-OpenAI model name.

## Other Variables

### TURNSTILE_SECRET_KEY
- **Required**: Yes (for production, when Turnstile is enabled)
- **Default**: none

### NEXT_PUBLIC_TURNSTILE_SITE_KEY
- **Required**: Required for frontend widget when Turnstile is enabled.

### NEXT_PUBLIC_TURNSTILE_ENABLED
- **Required**: No
- **Default**: `true`
- Set to `false` to disable Turnstile verification entirely.

## Configuration Methods

### Development (Local)
1. Copy `.env.example` to `.env`
2. Update values in `.env` with the credentials for **the provider you selected via `ACTIVE_PROVIDER`**
3. The application will automatically load these values

### Docker

1. **Using -e flag**:
   ```bash
   docker run -p 3000:3000 \
     -e ACTIVE_PROVIDER=nvidia \
     -e NVIDIA_API_KEY=nvapi-… \
     -e NVIDIA_MODEL=meta/llama-3.1-70b-instruct \
     grammar-check
   ```

2. **Using env_file**:
   ```bash
   docker run -p 3000:3000 --env-file .env grammar-check
   ```

3. **Using Docker Compose** (recommended):
   ```bash
   cp .env.example .env
   # Edit .env with your provider's credentials
   docker-compose up
   ```

### Production Deployment

#### Vercel
- Add each env var under Project Settings → Environment Variables.

#### Heroku
  ```bash
  heroku config:set ACTIVE_PROVIDER=nvidia NVIDIA_API_KEY=…
  ```

#### Google Cloud Run
  ```bash
  gcloud run deploy --set-env-vars ACTIVE_PROVIDER=nvidia,NVIDIA_API_KEY=…
  ```

## Security Best Practices

1. **Never commit .env files** — already on `.gitignore`.
2. **Use strong API keys** — rotate regularly.
3. **Limit API key scopes** — use the narrowest scopes available.
4. **Environment-specific keys** — different keys per environment.
5. **Secret management** — use a secret manager in production.

## Troubleshooting

### "LLM provider is not configured" (HTTP 500)
**Cause**: `ACTIVE_PROVIDER` is set but the corresponding provider's API key (or `CUSTOM_BASE_URL`) is missing.
**Solution**: Check the response body's `details` field. It will say exactly which env var is missing for the active provider, e.g.:
```
{
  "error": "LLM provider is not configured",
  "details": "NVIDIA NIM is selected (ACTIVE_PROVIDER='nvidia') but NVIDIA_API_KEY is not set.",
  "provider": "nvidia"
}
```

### "Unknown ACTIVE_PROVIDER"
**Solution**: Choose one of `openrouter`, `nvidia`, or `custom` (case-insensitive). The factory throws a list of supported values.

### Provider-specific auth errors
- **OpenRouter**: HTTP `401 Unauthorized` → API key invalid or expired.
- **NVIDIA NIM**: HTTP `403 Forbidden` → regenerate API key, or check the model id is available in your NIM account.
- **Custom**: HTTP `401` / `403` → check `CUSTOM_BASE_URL` and bearer token match the endpoint.

### Model not found
**Solution**: Verify the model id in the corresponding `*_MODEL` env var is supported by the active provider.

### Environment Variables Not Loaded
1. Verify `.env` is in the project root.
2. Variable names are case-sensitive.
3. Restart after edits (especially when not using hot-reload).

## Default Values

| Variable        | Default                                  |
|-----------------|------------------------------------------|
| `ACTIVE_PROVIDER` | `openrouter`                           |
| `NEXTJS_URL`    | `http://localhost:3000`                  |
| `OPENROUTER_MODEL` | `mistralai/mistral-7b-instruct:free`  |
| `NVIDIA_MODEL`  | `meta/llama-3.1-70b-instruct`            |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `CUSTOM_MODEL`  | `gpt-3.5-turbo`                          |

Each provider's API key (and `CUSTOM_BASE_URL`) has no default and must be set for the corresponding provider if you select it.
