import { NextRequest } from 'next/server';
import { getStreamingAIProvider, isStreamingAvailable } from '@/lib/ai/ai-provider';

export async function POST(req: NextRequest) {
  console.log('Streaming AI enhancement API called');
  try {
    const { text, language = 'english', reportType = 'general', additionalInstructions = '' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if streaming is available
    if (!isStreamingAvailable()) {
      return new Response(
        JSON.stringify({
          error: 'Streaming is not available. Make sure USE_VERCEL_AI and USE_AI_STREAMING are set to true.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the streaming AI provider
    const streamingEnhanceText = getStreamingAIProvider();

    // Call the streaming enhancement function
    const stream = await streamingEnhanceText(text, { language, reportType, additionalInstructions });

    // Return the streaming response
    return new Response(stream);
  } catch (error) {
    console.error('Error in streaming text enhancement:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to enhance text' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
