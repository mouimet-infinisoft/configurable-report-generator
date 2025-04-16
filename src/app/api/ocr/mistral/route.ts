import { NextRequest } from 'next/server';
import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();
    
    if (!image) {
      return Response.json({ error: 'Image is required' }, { status: 400 });
    }
    
    // Create Mistral provider
    const mistralProvider = mistral({
      apiKey: process.env.MISTRAL_AI_API_KEY
    });
    
    // Generate text from image
    const result = await generateText({
      model: mistralProvider('pixtral-large-latest'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Extract all text from this image'
            },
            {
              type: 'image_url',
              image_url: image
            }
          ]
        }
      ]
    });
    
    return Response.json({
      text: result.text,
      model: 'pixtral-large-latest'
    });
  } catch (error) {
    console.error('Error in Mistral OCR:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'An error occurred during OCR processing' },
      { status: 500 }
    );
  }
}
