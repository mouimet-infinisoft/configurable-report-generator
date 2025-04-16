/**
 * Feature flags for AI functionality
 * These flags control which implementation to use for AI features
 */

// Server-side feature flags (used in API routes)
export const SERVER_AI_FEATURE_FLAGS = {
  // Whether to use Vercel AI SDK instead of direct API calls
  useVercelAI: process.env.USE_VERCEL_AI === 'true',

  // Whether to use streaming responses (only works with Vercel AI SDK)
  useStreaming: process.env.USE_AI_STREAMING === 'true',
};

// Client-side feature flags (used in components)
export const CLIENT_AI_FEATURE_FLAGS = {
  // Whether to use Vercel AI SDK instead of direct API calls
  useVercelAI: process.env.NEXT_PUBLIC_USE_VERCEL_AI === 'true',

  // Whether to use streaming responses (only works with Vercel AI SDK)
  useStreaming: process.env.NEXT_PUBLIC_USE_AI_STREAMING === 'true',
};

// Use the appropriate feature flags based on environment
export const AI_FEATURE_FLAGS = typeof window === 'undefined'
  ? SERVER_AI_FEATURE_FLAGS
  : CLIENT_AI_FEATURE_FLAGS;

/**
 * Helper function to log which AI implementation is being used
 */
export function logAIImplementation() {
  console.log(`AI Implementation: ${AI_FEATURE_FLAGS.useVercelAI ? 'Vercel AI SDK' : 'Direct API'}`);
  console.log(`AI Streaming: ${AI_FEATURE_FLAGS.useStreaming ? 'Enabled' : 'Disabled'}`);
}
