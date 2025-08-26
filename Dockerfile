# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Define build arguments for environment variables
ARG OPENROUTER_API_KEY
ARG TURNSTILE_SECRET_KEY
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_TURNSTILE_ENABLED
ARG NEXTJS_URL
ARG OPENROUTER_MODEL

# Set environment variables
ENV OPENROUTER_API_KEY=$OPENROUTER_API_KEY
ENV TURNSTILE_SECRET_KEY=$TURNSTILE_SECRET_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_ENABLED=$NEXT_PUBLIC_TURNSTILE_ENABLED
ENV NEXTJS_URL=$NEXTJS_URL
ENV OPENROUTER_MODEL=$OPENROUTER_MODEL

# Expose the port the app runs on
EXPOSE 3000

# Build the Next.js application
RUN npm run build

# Start the application
CMD ["npm", "start"]