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
  console.log('Enhancing text, length:', text.length);
  const { language = 'english', reportType = 'general', additionalInstructions = '' } = options;

  try {
    console.log('Calling AI enhance API endpoint');
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

/**
 * Parse sections from formatted text
 */
function parseSections(text: string) {
  // Simple section parsing based on headings
  const sectionRegex = /^#+\s+(.+)$|^(.+)\n[=\-]+$/gm;
  const sections = [];
  let lastIndex = 0;
  let lastTitle = 'Introduction';

  // Find all section headings
  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    const title = match[1] || match[2];
    const startIndex = match.index;

    // Add the previous section
    if (lastIndex > 0) {
      const content = text.substring(lastIndex, startIndex).trim();
      if (content) {
        sections.push({ title: lastTitle, content });
      }
    } else if (startIndex > 0) {
      // Add content before the first heading as introduction
      const intro = text.substring(0, startIndex).trim();
      if (intro) {
        sections.push({ title: 'Introduction', content: intro });
      }
    }

    lastIndex = startIndex + match[0].length;
    lastTitle = title;
  }

  // Add the last section
  if (lastIndex < text.length) {
    const content = text.substring(lastIndex).trim();
    if (content) {
      sections.push({ title: lastTitle, content });
    }
  }

  // If no sections were found, treat the entire text as one section
  if (sections.length === 0 && text.trim()) {
    sections.push({ title: 'Report', content: text.trim() });
  }

  return sections;
}
