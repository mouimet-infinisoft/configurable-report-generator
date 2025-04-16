'use client';

import { useState, useCallback } from 'react';
import { 
  extractTextFromImage, 
  OCRLanguage, 
  OCRResult, 
  batchProcessImages 
} from './tesseract-service';

export interface OCRState {
  results: OCRResult[];
  isProcessing: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export interface UseOCROptions {
  language?: OCRLanguage;
  autoProcess?: boolean;
}

export function useOCR(imageUrls: string[] = [], options: UseOCROptions = {}) {
  const { language = 'eng', autoProcess = false } = options;
  
  const [state, setState] = useState<OCRState>({
    results: [],
    isProcessing: false,
    progress: 0,
    status: 'idle',
    error: null,
  });
  
  // Process a single image
  const processImage = useCallback(async (imageUrl: string) => {
    if (!imageUrl) return null;
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      status: 'initializing',
      error: null,
    }));
    
    try {
      const result = await extractTextFromImage(imageUrl, {
        language,
        onProgress: (progress) => {
          setState(prev => ({
            ...prev,
            progress: progress.progress * 100,
            status: progress.status,
          }));
        },
      });
      
      setState(prev => ({
        ...prev,
        results: [...prev.results, result],
        isProcessing: false,
        status: 'completed',
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        status: 'error',
        error: errorMessage,
      }));
      return null;
    }
  }, [language]);
  
  // Process multiple images in sequence
  const processImages = useCallback(async (urls: string[] = imageUrls) => {
    if (urls.length === 0) return [];
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      status: 'initializing',
      error: null,
      results: [],
    }));
    
    try {
      const results = await batchProcessImages(urls, {
        language,
        onProgress: (progress) => {
          setState(prev => ({
            ...prev,
            progress: progress.progress * 100,
            status: progress.status,
          }));
        },
      });
      
      setState(prev => ({
        ...prev,
        results,
        isProcessing: false,
        status: 'completed',
        progress: 100,
      }));
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        status: 'error',
        error: errorMessage,
      }));
      return [];
    }
  }, [imageUrls, language]);
  
  // Reset the OCR state
  const reset = useCallback(() => {
    setState({
      results: [],
      isProcessing: false,
      progress: 0,
      status: 'idle',
      error: null,
    });
  }, []);
  
  // Auto-process images if enabled
  if (autoProcess && imageUrls.length > 0 && state.results.length === 0 && !state.isProcessing) {
    processImages(imageUrls).catch(console.error);
  }
  
  return {
    ...state,
    processImage,
    processImages,
    reset,
  };
}
