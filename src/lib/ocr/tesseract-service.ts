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
    // Create a worker with progress logging
    // Use type assertion to work around TypeScript limitations with the Tesseract.js API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workerOptions: any = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger: (m: any) => {
        if (onProgress && typeof m.progress !== 'undefined') {
          onProgress({
            status: m.status,
            progress: m.progress
          });
        }
      }
    };
    // Use type assertion for the worker to handle TypeScript limitations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker: any = await createWorker(workerOptions);

    // Load language data
    await worker.loadLanguage(language);
    await worker.initialize(language);

    // Recognize text in the image
    const { data } = await worker.recognize(imageUrl);

    // Terminate the worker when done
    await worker.terminate();

    // Parse paragraphs
    const paragraphs = data.text
      .split('\n\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    // Create a structured result
    const ocrResult: OCRResult = {
      text: data.text,
      confidence: data.confidence,
      paragraphs,
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
