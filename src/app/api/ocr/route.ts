import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

// Mock data for when API key is not available
const mockOCRResponse = {
  text: 'This is a mock OCR response. The actual OCR service is not configured properly.\n\nPlease add your Together AI API key to the .env.local file.\n\nThis is a sample paragraph to demonstrate text extraction.',
  confidence: 0.85
};

export async function POST(req: NextRequest) {
  console.log('OCR API endpoint called');
  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Check if Together AI API key is configured
    // First try TOGETHER_AI_API_KEY (preferred), then fall back to TOGETHER_API_KEY (legacy)
    const apiKey = process.env.TOGETHER_AI_API_KEY || process.env.TOGETHER_API_KEY;
    console.log('Together API key configured:', !!apiKey);
    if (!apiKey) {
      console.warn('Together AI API key is not configured, using mock OCR response');
      return NextResponse.json(mockOCRResponse);
    }

    // Create prompt optimized for handwritten text extraction
    const prompt = `Extract all the text from this handwritten document. Do not include any explanations or additional text.`;

    // Call Together AI API directly
    console.log('Calling Together AI API for OCR...');
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

    console.log('Together API response status:', response.status);
    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = await response.json() as any;
      console.error('Together API error:', errorData);
      throw new Error(errorData.error || 'Failed to process image');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await response.json() as any;
    console.log('Together API response received, has content:', !!result.choices[0]?.message?.content);
    const text = result.choices[0]?.message?.content || '';
    console.log('Extracted text length:', text.length);

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
