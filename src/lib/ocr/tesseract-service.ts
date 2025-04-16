import { createWorker } from 'tesseract.js';
import { OCROptions, OCRResult } from './types';

/**
 * Extract text from an image using Tesseract.js
 */
export async function extractTextFromImage(
  imageUrl: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  const { language = 'eng', onProgress } = options;

  try {
    // Create a worker with the language option directly
    const worker = await createWorker(language);

    // Set progress callback if provided
    if (onProgress) {
      // We'll manually update progress at key points
      onProgress({ status: 'recognizing', progress: 0.5 });
    }

    // Recognize text in the image
    const result = await worker.recognize(imageUrl);

    if (onProgress) {
      onProgress({ status: 'recognized', progress: 1.0 });
    }

    // Terminate the worker when done
    await worker.terminate();

    // Parse paragraphs
    const paragraphs = result.data.text
      .split('\n\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    // Create a structured result
    const ocrResult: OCRResult = {
      text: result.data.text,
      confidence: result.data.confidence,
      paragraphs,
      language: language,
    };

    return ocrResult;
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown OCR processing error',
    };
  }
}

/**
 * Process multiple images in sequence
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

    const result = await extractTextFromImage(imageUrl, {
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
