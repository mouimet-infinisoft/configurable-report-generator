import { togetherai } from '@ai-sdk/togetherai';
import { generateText, streamText } from 'ai';
import { EnhancementOptions, EnhancementResult } from './types';
import { createEnhancementPrompt, parseSections } from './utils';
import { mockEnhanceText } from './mock-enhancement';

/**
 * Enhance text using Vercel AI SDK with Together AI
 */
export async function enhanceTextWithVercelAI(
  text: string,
  options: EnhancementOptions = {}
): Promise<EnhancementResult> {
  console.log('Enhancing text with Vercel AI SDK, length:', text.length);
  const { language = 'english', reportType = 'general', additionalInstructions = '' } = options;

  try {
    // Check if Together AI API key is configured
    // The Vercel AI SDK will use TOGETHER_AI_API_KEY automatically
    // We only check if any key is available for fallback to mock enhancement
    const apiKeyAvailable = !!process.env.TOGETHER_AI_API_KEY;
    console.log('Together API key configured:', apiKeyAvailable);

    // If no API key, use mock enhancement instead
    if (!apiKeyAvailable) {
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
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      'mistralai/Mistral-7B-Instruct-v0.3'
    ];

    // Try each model in sequence until one works
    for (const modelName of models) {
      console.log(`Trying model with Vercel AI SDK: ${modelName}...`);

      try {
        // Use the generateText function from Vercel AI SDK
        // The API key is read from TOGETHER_AI_API_KEY environment variable
        const result = await generateText({
          model: togetherai(modelName),
          prompt: prompt,
          maxTokens: 2000,
          temperature: 0.7,
        });

        // Get the text from the response
        const enhancedText = result.text;

        console.log(`Success with Vercel AI SDK model ${modelName}, text length:`, enhancedText.length);

        // Parse sections
        const sections = parseSections(enhancedText);

        return {
          enhancedText,
          sections,
          model: modelName
        };
      } catch (error) {
        console.error(`Error with Vercel AI SDK model ${modelName}:`, error);
        // Continue to the next model
      }
    }

    // If we get here, all models failed
    throw new Error('All AI models failed with Vercel AI SDK');
  } catch (error) {
    console.error('Error enhancing text with Vercel AI SDK:', error);

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
 * Enhance text using Vercel AI SDK with streaming support
 */
export async function streamingEnhanceTextWithVercelAI(
  text: string,
  options: EnhancementOptions = {}
) {
  console.log('Streaming text enhancement with Vercel AI SDK, length:', text.length);
  const { language = 'english', reportType = 'general', additionalInstructions = '' } = options;

  // Check if Together AI API key is configured
  // The Vercel AI SDK will use TOGETHER_AI_API_KEY automatically
  // We only check if any key is available for fallback to mock enhancement
  const apiKeyAvailable = !!process.env.TOGETHER_AI_API_KEY;
  console.log('Together API key configured for streaming:', apiKeyAvailable);

  // If no API key, use mock enhancement instead
  if (!apiKeyAvailable) {
    console.warn('Together AI API key is not configured, using mock enhancement');
    const enhancedText = mockEnhanceText(text);

    // Create a simple stream from the mock text
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(enhancedText));
        controller.close();
      }
    });

    return stream;
  }

  // Create prompt for text enhancement
  const prompt = createEnhancementPrompt(text, language, reportType, additionalInstructions);

  try {
    // Use the streamText function from Vercel AI SDK
    // The API key is read from TOGETHER_AI_API_KEY environment variable
    const result = await streamText({
      model: togetherai('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'),
      prompt: prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    // Return the text stream
    return result.textStream;
  } catch (error) {
    console.error('Error in streaming text enhancement:', error);

    // Create an error stream
    return new ReadableStream({
      start(controller) {
        controller.error(error);
      }
    });
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
