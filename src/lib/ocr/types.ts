export type OCRLanguage = 'eng' | 'fra' | 'eng+fra';
export type OCRProgressCallback = (progress: { status: string; progress: number }) => void;

export interface OCROptions {
  language?: OCRLanguage;
  onProgress?: OCRProgressCallback;
  preferAI?: boolean; // New option to prefer AI processing
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
  processedWithAI?: boolean; // New field to indicate if AI was used
}

export interface OCRState {
  results: OCRResult[];
  isProcessing: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export interface UseOCROptions {
  language?: OCRLanguage;
  preferAI?: boolean;
  autoProcess?: boolean;
}
