import { EnhancementOptions, EnhancementResult } from './types';
import { createEnhancementPrompt, parseSections } from './utils';
import { mockEnhanceText } from './mock-enhancement';

/**
 * Enhance text using direct API calls to Together AI
 * This is the original implementation before Vercel AI SDK integration
 */
export async function enhanceTextWithDirectAPI(
  text: string,
  options: EnhancementOptions = {}
): Promise<EnhancementResult> {
  console.log('Enhancing text with Direct API, length:', text.length);
  const { language = 'english', reportType = 'general', additionalInstructions = '' } = options;

  try {
    // Check if Together AI API key is configured
    const apiKey = process.env.TOGETHER_API_KEY;
    console.log('Together API key configured:', !!apiKey);

    // If no API key, use mock enhancement instead
    if (!apiKey) {
      console.warn('Together AI API key is not configured, using mock enhancement');
      const enhancedText = mockEnhanceText(text);
      const sections = parseSections(enhancedText);

      return {
        enhancedText,
        sections
      };
    }

    // Create prompt for text enhancement
    const prompt = createEnhancementPrompt(text, language, reportType, additionalInstructions);

    // Define models to try in order of preference
    const models = [
      'meta-llama/Llama-3.1-8B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.2',
      'gpt-3.5-turbo'
    ];

    // Call Together AI API
    console.log('Calling Together AI API directly...');
    let lastError = null;

    // Try each model in sequence until one works
    for (const model of models) {
      console.log(`Trying model: ${model}...`);
      try {
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
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

        console.log('Together API response received, status:', response.status);

        // Parse the response JSON only once
        let result: any;
        try {
          result = await response.json();
          console.log('Together API response parsed successfully');
        } catch (parseError) {
          console.error(`Error parsing response from model ${model}:`, parseError);
          lastError = new Error('Failed to parse API response');
          // Continue to the next model
          continue;
        }

        if (!response.ok) {
          console.error(`Error with model ${model}:`, result);
          // Handle the error object structure correctly
          const errorMessage = result.error?.message ||
                              (typeof result.error === 'object' ? JSON.stringify(result.error) : result.error) ||
                              'Failed to enhance text';
          lastError = new Error(errorMessage);
          // Continue to the next model
          continue;
        }

        // Success! We got a valid response
        const enhancedText = result.choices?.[0]?.message?.content || '';
        console.log(`Success with model ${model}, text length:`, enhancedText.length);

        // Parse sections if possible
        const sections = parseSections(enhancedText);

        return {
          enhancedText,
          sections,
          model // Include which model was used
        };
      } catch (apiError) {
        console.error(`Error with model ${model}:`, apiError);
        lastError = apiError;
        // Continue to the next model
      }
    }

    // If we get here, all models failed
    console.error('All models failed, using last error:', lastError);
    throw new Error(lastError instanceof Error ? lastError.message : 'All AI models failed');
  } catch (error) {
    console.error('Error enhancing text with Direct API:', error);

    // Create a simple formatted version of the text as a fallback
    const formattedText = formatTextAsFallback(text);

    return {
      enhancedText: formattedText,
      sections: parseSections(formattedText),
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
