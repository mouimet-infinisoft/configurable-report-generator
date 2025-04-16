import { OCRResult, OCROptions } from './types';

/**
 * Extract text from an image using Together AI vision models
 */
export async function extractTextWithAI(
  imageUrl: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  const { language = 'fra', onProgress } = options;

  try {
    // Update progress
    if (onProgress) {
      onProgress({ status: 'initializing', progress: 0.1 });
    }

    // Convert image to base64 if it's not already
    const imageData = imageUrl.startsWith('data:')
      ? imageUrl
      : await fetchImageAsBase64(imageUrl);

    // Update progress
    if (onProgress) {
      onProgress({ status: 'processing', progress: 0.3 });
    }

    // Call our API endpoint
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process image');
    }

    // Update progress
    if (onProgress) {
      onProgress({ status: 'finalizing', progress: 0.9 });
    }

    const result = await response.json();

    // Parse paragraphs
    const paragraphs = result.text
      .split('\n\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    // Final progress update
    if (onProgress) {
      onProgress({ status: 'completed', progress: 1.0 });
    }

    return {
      text: result.text,
      confidence: result.confidence,
      paragraphs,
      language,
      processedWithAI: true,
    };
  } catch (error) {
    console.error('AI OCR processing error:', error);
    return {
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown OCR processing error',
    };
  }
}

/**
 * Helper function to convert image URL to base64
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Process multiple images in sequence
 */
export async function batchProcessImagesWithAI(
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

    const result = await extractTextWithAI(imageUrl, {
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
