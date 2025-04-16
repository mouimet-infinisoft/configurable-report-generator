# Vercel AI SDK Integration

This document describes the integration of the Vercel AI SDK into the Configurable Report Generator application.

## Overview

The Vercel AI SDK integration provides a more streamlined way to interact with AI providers, including streaming capabilities for real-time responses. This implementation runs in parallel with the existing direct API implementation, allowing for a smooth transition and easy comparison between the two approaches.

## Architecture

The integration follows a parallel implementation pattern with feature flags to control which implementation to use:

1. **Feature Flags**: Control which implementation to use (direct API or Vercel AI SDK)
2. **AI Provider Factory**: Returns the appropriate implementation based on feature flags
3. **Service Layer**: Implements both direct API and Vercel AI SDK approaches
4. **API Routes**: Support both standard and streaming responses

## Components

### Feature Flags

Located in `src/lib/ai/feature-flags.ts`, these control which implementation to use:

- `USE_VERCEL_AI`: When set to 'true', uses the Vercel AI SDK implementation
- `USE_AI_STREAMING`: When set to 'true', enables streaming responses (requires `USE_VERCEL_AI=true`)

### AI Provider Factory

Located in `src/lib/ai/ai-provider.ts`, this factory returns the appropriate implementation based on feature flags:

- `getAIProvider()`: Returns the standard enhancement function
- `getStreamingAIProvider()`: Returns the streaming enhancement function
- `isStreamingAvailable()`: Checks if streaming is available based on feature flags

### Service Layer

- `src/lib/ai/direct-api-service.ts`: Original implementation using direct API calls
- `src/lib/ai/vercel-ai-service.ts`: New implementation using Vercel AI SDK
- `src/lib/ai/utils.ts`: Shared utility functions
- `src/lib/ai/types.ts`: Type definitions
- `src/lib/ai/mock-enhancement.ts`: Mock implementation for when API keys are not available

### API Routes

- `src/app/api/ai/enhance/route.ts`: Standard API route for text enhancement
- `src/app/api/ai/enhance/streaming/route.ts`: Streaming API route for real-time responses

### Client Components

- `src/components/ai/ai-enhancement-toggle.tsx`: UI component to toggle between implementations
- `src/app/ai-demo/page.tsx`: Demo page to test both implementations

## Usage

### Environment Variables

Add the following to your `.env.local` file:

```
# Feature flags
USE_VERCEL_AI=true|false
USE_AI_STREAMING=true|false
```

### Client-Side Usage

```typescript
import { enhanceText, isStreamingEnhancementAvailable } from '@/lib/ai/text-enhancement';

// Standard usage
const result = await enhanceText(text, {
  language: 'french',
  reportType: 'driver-evaluation',
  useStreaming: false
});

// Streaming usage (if available)
const result = await enhanceText(text, {
  language: 'french',
  reportType: 'driver-evaluation',
  useStreaming: true
});
```

## Testing

A demo page is available at `/ai-demo` to test both implementations side by side.

## Benefits of Vercel AI SDK

1. **Streaming Responses**: Real-time feedback as the AI generates text
2. **Simplified Provider Switching**: Easier to switch between different AI providers
3. **Better Error Handling**: More consistent error handling across providers
4. **Type Safety**: Better TypeScript integration

## Limitations

1. **Compatibility**: Not all AI providers are supported by Vercel AI SDK
2. **Streaming Support**: Requires client-side support for streaming responses

## Future Improvements

1. **Add More AI Providers**: Integrate with additional providers like OpenAI, Anthropic, etc.
2. **Improve Streaming UI**: Create better UI components for streaming responses
3. **Add Provider Selection**: Allow users to select which AI provider to use
4. **Implement Caching**: Add caching for AI responses to improve performance
