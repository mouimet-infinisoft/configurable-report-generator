import { createWorker } from 'tesseract.js';

export type OCRLanguage = 'eng' | 'fra' | 'eng+fra';
export type OCRProgressCallback = (progress: { status: string; progress: number }) => void;

export interface OCROptions {
  language?: OCRLanguage;
  onProgress?: OCRProgressCallback;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  paragraphs?: string[];
  language?: string;
  imageWidth?: number;
  imageHeight?: number;
  error?: string;
}

/**
 * Extract text from an image using Tesseract.js
 */
export async function extractTextFromImage(
  imageUrl: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  const { language = 'eng', onProgress } = options;

  try {
    // Create a new worker
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker: any = await createWorker(language);

    // Set up progress tracking if provided
    if (onProgress) {
      worker.setProgressHandler((progress: { status: string; progress: number }) => {
        onProgress(progress);
      });
    }

    // Recognize text in the image
    const result = await worker.recognize(imageUrl);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      words: result.data.words?.map((word: any) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox,
      })),
      paragraphs,
      language: result.data.language,
      imageWidth: result.data.imageWidth,
      imageHeight: result.data.imageHeight,
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

  for (const imageUrl of imageUrls) {
    const result = await extractTextFromImage(imageUrl, options);
    results.push(result);
  }

  return results;
}
