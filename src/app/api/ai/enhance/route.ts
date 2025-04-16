import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/ai-provider';

export async function POST(req: NextRequest) {
  console.log('AI enhancement API called');
  try {
    const { text, language = 'english', reportType = 'general', additionalInstructions = '' } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get the appropriate AI provider based on feature flags
    const enhanceText = getAIProvider();

    // Call the enhancement function
    const result = await enhanceText(text, { language, reportType, additionalInstructions });

    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error enhancing text:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enhance text' },
      { status: 500 }
    );
  }
}


