import { OCROptions, OCRResult } from './types';

/**
 * Extract text from an image using Mistral's Pixtral model
 */
export async function extractTextWithMistral(
  imageUrl: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  const { onProgress } = options;
  
  if (onProgress) {
    onProgress({
      status: 'Initializing Mistral OCR',
      progress: 0.1
    });
  }
  
  try {
    if (onProgress) {
      onProgress({
        status: 'Processing with Mistral Pixtral',
        progress: 0.3
      });
    }
    
    const response = await fetch('/api/ocr/mistral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageUrl,
        prompt: 'Extract all text from this image and preserve the formatting'
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process image with Mistral OCR');
    }
    
    const data = await response.json();
    
    if (onProgress) {
      onProgress({
        status: 'OCR completed',
        progress: 1.0
      });
    }
    
    return {
      text: data.text,
      confidence: 0.95, // Mistral is generally high confidence
      language: options.language || 'fra',
      model: data.model || 'pixtral-large-latest',
      words: [],
      paragraphs: []
    };
  } catch (error) {
    console.error('Error in Mistral OCR:', error);
    throw error;
  }
}
