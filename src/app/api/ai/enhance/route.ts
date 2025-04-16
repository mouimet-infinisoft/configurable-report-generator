import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'english', reportType = 'general', additionalInstructions = '' } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Check if Together AI API key is configured
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      console.error('Together AI API key is not configured');
      return NextResponse.json(
        { error: 'AI service is not properly configured' },
        { status: 500 }
      );
    }
    
    // Create prompt for text enhancement
    const prompt = createEnhancementPrompt(text, language, reportType, additionalInstructions);
    
    // Call Together AI API
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert report writer who can transform raw text into well-structured, professional reports.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = await response.json() as any;
      throw new Error(errorData.error || 'Failed to enhance text');
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await response.json() as any;
    const enhancedText = result.choices[0]?.message?.content || '';
    
    // Parse sections if possible
    const sections = parseSections(enhancedText);
    
    return NextResponse.json({ 
      enhancedText,
      sections
    });
  } catch (error) {
    console.error('Error enhancing text:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enhance text' },
      { status: 500 }
    );
  }
}

/**
 * Create a prompt for text enhancement based on the input parameters
 */
function createEnhancementPrompt(
  text: string, 
  language: string, 
  reportType: string,
  additionalInstructions: string
): string {
  return `
I need you to transform the following raw text (extracted from OCR) into a well-structured, professional report.

Language: ${language}
Report Type: ${reportType}
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}

Here's the raw text:
---
${text}
---

Please:
1. Correct any spelling or grammar errors
2. Organize the content into logical sections with headings
3. Format the text professionally
4. Maintain all factual information from the original text
5. Add appropriate transitions between sections
6. Use professional language suitable for a formal report

Return the enhanced text in a clean, well-structured format with clear section headings.
`;
}

/**
 * Parse sections from the enhanced text
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
