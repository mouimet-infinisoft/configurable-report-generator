import { AI_FEATURE_FLAGS } from './feature-flags';
import { parseSections } from './utils';

/**
 * Service for enhancing OCR text using AI
 */

export interface EnhancementOptions {
  language?: string;
  reportType?: string;
  additionalInstructions?: string;
  useStreaming?: boolean; // Whether to use streaming if available
}

export interface EnhancementResult {
  enhancedText: string;
  sections?: {
    title: string;
    content: string;
  }[];
  model?: string;
  error?: string;
}

/**
 * Check if streaming enhancement is available and enabled
 */
export function isStreamingEnhancementAvailable(): boolean {
  return AI_FEATURE_FLAGS.useVercelAI && AI_FEATURE_FLAGS.useStreaming;
}

/**
 * Enhance OCR text using AI to create structured report content
 */
export async function enhanceText(
  text: string,
  options: EnhancementOptions = {}
): Promise<EnhancementResult> {
  console.log('Enhancing text, length:', text.length);
  const {
    language = 'english',
    reportType = 'general',
    additionalInstructions = '',
    useStreaming = false
  } = options;

  // Check if streaming should be used
  const shouldUseStreaming = useStreaming && isStreamingEnhancementAvailable();
  console.log(`Using ${shouldUseStreaming ? 'streaming' : 'standard'} enhancement`);

  try {
    // Prepare request body
    const requestBody = JSON.stringify({
      text,
      language,
      reportType,
      additionalInstructions
    });

    if (shouldUseStreaming) {
      // Use streaming API endpoint
      return await handleStreamingEnhancement(requestBody);
    } else {
      // Use standard API endpoint
      return await handleStandardEnhancement(requestBody);
    }
  } catch (error) {
    console.error('AI enhancement error:', error);

    // Create a simple formatted version of the text as a fallback
    const formattedText = formatTextAsFallback(text);

    return {
      enhancedText: formattedText,
      sections: createFallbackSections(formattedText),
      error: error instanceof Error ? error.message : 'Unknown error enhancing text',
    };
  }
}

/**
 * Handle standard (non-streaming) enhancement
 */
async function handleStandardEnhancement(requestBody: string): Promise<EnhancementResult> {
  console.log('Calling standard AI enhance API endpoint');
  const response = await fetch('/api/ai/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody,
  });
  console.log('API response status:', response.status);

  // Parse the response JSON only once
  let responseData;
  try {
    responseData = await response.json();
    console.log('Response data received:', responseData);
  } catch (parseError) {
    console.error('Error parsing JSON response:', parseError);
    throw new Error('Failed to parse enhancement response');
  }

  if (!response.ok) {
    console.error('Error enhancing text:', responseData);
    throw new Error(
      responseData.error ||
      (typeof responseData === 'object' ? JSON.stringify(responseData) : 'Failed to enhance text')
    );
  }

  console.log('Enhancement result received, has sections:', !!responseData.sections);
  return responseData;
}

/**
 * Handle streaming enhancement
 */
async function handleStreamingEnhancement(requestBody: string): Promise<EnhancementResult> {
  console.log('Calling streaming AI enhance API endpoint');
  const response = await fetch('/api/ai/enhance/streaming', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody,
  });
  console.log('Streaming API response status:', response.status);

  if (!response.ok) {
    let errorMessage = 'Failed to enhance text with streaming';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse the error, use the default message
    }
    throw new Error(errorMessage);
  }

  // Read the streaming response
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get reader from streaming response');
  }

  let enhancedText = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    enhancedText += new TextDecoder().decode(value);
  }

  console.log('Streaming enhancement complete, text length:', enhancedText.length);

  // Parse sections from the enhanced text
  const sections = parseSections(enhancedText);

  return {
    enhancedText,
    sections,
    model: 'streaming' // Indicate that this was processed with streaming
  };
}

/**
 * Format text as a fallback when AI enhancement fails
 */
function formatTextAsFallback(text: string): string {
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  // Create a simple formatted version with headings
  let result = '# Report\n\n';

  if (paragraphs.length > 0) {
    // Add first paragraph as introduction
    result += paragraphs[0] + '\n\n';

    // Add remaining paragraphs as sections
    for (let i = 1; i < paragraphs.length; i++) {
      result += `## Section ${i}\n\n${paragraphs[i]}\n\n`;
    }

    // Add a simple conclusion
    result += '## Conclusion\n\nThis concludes the report based on the provided information.';
  } else {
    // If no paragraphs, just use the original text
    result += text;
  }

  return result;
}

/**
 * Create fallback sections from formatted text
 */
function createFallbackSections(formattedText: string) {
  return parseSections(formattedText);
}
