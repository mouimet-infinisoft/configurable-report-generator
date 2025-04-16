import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req: NextRequest) {
  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Check if Together AI API key is configured
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      console.error('Together AI API key is not configured');
      return NextResponse.json(
        { error: 'OCR service is not properly configured' },
        { status: 500 }
      );
    }

    // Create prompt optimized for handwritten text extraction
    const prompt = `Extract all the text from this handwritten document. Do not include any explanations or additional text.`;

    // Call Together AI API directly
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = await response.json() as any;
      throw new Error(errorData.error || 'Failed to process image');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await response.json() as any;
    const text = result.choices[0]?.message?.content || '';

    return NextResponse.json({
      text,
      confidence: 0.95, // Together AI doesn't provide confidence scores directly
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
}

// Increase the request size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
