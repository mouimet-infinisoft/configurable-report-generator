/**
 * Service for enhancing OCR text using AI
 */

export interface EnhancementOptions {
  language?: string;
  reportType?: string;
  additionalInstructions?: string;
}

export interface EnhancementResult {
  enhancedText: string;
  sections?: {
    title: string;
    content: string;
  }[];
  error?: string;
}

/**
 * Enhance OCR text using AI to create structured report content
 */
export async function enhanceText(
  text: string,
  options: EnhancementOptions = {}
): Promise<EnhancementResult> {
  const { language = 'english', reportType = 'general', additionalInstructions = '' } = options;
  
  try {
    // Call our API endpoint
    const response = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text, 
        language, 
        reportType,
        additionalInstructions
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to enhance text');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('AI enhancement error:', error);
    return {
      enhancedText: text,
      error: error instanceof Error ? error.message : 'Unknown error enhancing text',
    };
  }
}
