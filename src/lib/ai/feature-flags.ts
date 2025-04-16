/**
 * Feature flags for AI functionality
 * These flags control which implementation to use for AI features
 */
export const AI_FEATURE_FLAGS = {
  // Whether to use Vercel AI SDK instead of direct API calls
  useVercelAI: process.env.USE_VERCEL_AI === 'true',
  
  // Whether to use streaming responses (only works with Vercel AI SDK)
  useStreaming: process.env.USE_AI_STREAMING === 'true',
};

/**
 * Helper function to log which AI implementation is being used
 */
export function logAIImplementation() {
  console.log(`AI Implementation: ${AI_FEATURE_FLAGS.useVercelAI ? 'Vercel AI SDK' : 'Direct API'}`);
  console.log(`AI Streaming: ${AI_FEATURE_FLAGS.useStreaming ? 'Enabled' : 'Disabled'}`);
}
