import { AI_FEATURE_FLAGS, logAIImplementation } from './feature-flags';
import { enhanceTextWithDirectAPI } from './direct-api-service';
import { enhanceTextWithVercelAI, streamingEnhanceTextWithVercelAI } from './vercel-ai-service';
import { EnhanceTextFunction, StreamingEnhanceTextFunction } from './types';

/**
 * Get the appropriate AI enhancement function based on feature flags
 */
export function getAIProvider(): EnhanceTextFunction {
  logAIImplementation();

  if (AI_FEATURE_FLAGS.useVercelAI) {
    console.log('Using Vercel AI SDK for text enhancement');
    return enhanceTextWithVercelAI;
  } else {
    console.log('Using Direct API for text enhancement');
    return enhanceTextWithDirectAPI;
  }
}

/**
 * Get the streaming AI enhancement function (only available with Vercel AI SDK)
 */
export function getStreamingAIProvider(): StreamingEnhanceTextFunction {
  logAIImplementation();

  if (!AI_FEATURE_FLAGS.useVercelAI || !AI_FEATURE_FLAGS.useStreaming) {
    console.warn('Streaming requires Vercel AI SDK. Make sure both USE_VERCEL_AI and USE_AI_STREAMING are set to true.');
  }

  return streamingEnhanceTextWithVercelAI;
}

/**
 * Check if streaming is available based on feature flags
 */
export function isStreamingAvailable(): boolean {
  return AI_FEATURE_FLAGS.useVercelAI && AI_FEATURE_FLAGS.useStreaming;
}
