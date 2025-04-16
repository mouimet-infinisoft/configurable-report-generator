import { extractTextFromImage } from './tesseract-service';
import { extractTextWithAI } from './together-ai-service';
import { extractTextWithMistral } from './mistral-ocr-provider';
import { OCRResult, OCROptions } from './types';

/**
 * Determine if an image likely contains handwritten text
 * This is a simplified version - in production, you might use a more sophisticated approach
 */
async function isLikelyHandwritten(): Promise<boolean> {
  // For now, we'll assume all French text is handwritten
  // In a real implementation, you could use heuristics or a classifier
  return true;
}

/**
 * Process an image using the most appropriate OCR method
 * Will use AI for handwritten text and French language, and Tesseract for computer-generated text
 */
export async function processImage(
  imageUrl: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  const { language = 'eng', preferAI = false, useMistral = true } = options;

  // If Mistral is explicitly requested or not explicitly disabled, use it as the default
  if (useMistral) {
    return extractTextWithMistral(imageUrl, options);
  }

  // If French or AI is preferred, use AI OCR
  if (language === 'fra' || language === 'eng+fra' || preferAI) {
    return extractTextWithAI(imageUrl, options);
  }

  // For other cases, check if the image is likely handwritten
  const handwritten = await isLikelyHandwritten();

  if (handwritten) {
    return extractTextWithAI(imageUrl, options);
  } else {
    return extractTextFromImage(imageUrl, options);
  }
}

/**
 * Process multiple images using the most appropriate OCR method for each
 */
export async function batchProcessImages(
  imageUrls: string[],
  options: OCROptions = {}
): Promise<OCRResult[]> {
  const results: OCRResult[] = [];
  const totalImages = imageUrls.length;

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];

    // Update progress for batch processing
    if (options.onProgress) {
      const overallProgress = i / totalImages;
      options.onProgress({
        status: `Processing image ${i + 1} of ${totalImages}`,
        progress: overallProgress
      });
    }

    const result = await processImage(imageUrl, {
      ...options,
      onProgress: options.onProgress ? (progress) => {
        // Scale the individual image progress to the overall batch progress
        const scaledProgress = (i + progress.progress) / totalImages;
        options.onProgress!({
          status: progress.status,
          progress: scaledProgress
        });
      } : undefined
    });

    results.push(result);
  }

  return results;
}
