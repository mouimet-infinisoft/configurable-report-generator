'use client';

import { useState, useCallback } from 'react';
import { OCRState, UseOCROptions } from './types';
import { processImage, batchProcessImages } from './smart-ocr-provider';

export function useOCR(imageUrls: string[] = [], options: UseOCROptions = {}) {
  const { language = 'eng', autoProcess = false, preferAI = false } = options;

  const [state, setState] = useState<OCRState>({
    results: [],
    isProcessing: false,
    progress: 0,
    status: 'idle',
    error: null,
  });

  // Process a single image
  const processImageCallback = useCallback(async (imageUrl: string) => {
    if (!imageUrl) return null;

    setState(prev => ({
      ...prev,
      isProcessing: true,
      status: 'initializing',
      error: null,
    }));

    try {
      const result = await processImage(imageUrl, {
        language,
        preferAI,
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
  }, [language, preferAI]);

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
        preferAI,
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
  }, [imageUrls, language, preferAI]);

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
    processImage: processImageCallback,
    processImages,
    reset,
    preferAI,
  };
}
