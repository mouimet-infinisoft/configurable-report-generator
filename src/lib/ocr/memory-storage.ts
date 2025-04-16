/**
 * In-memory storage for OCR results
 * This is a temporary solution until the database issues are resolved
 */

import { OCRResult } from '@/lib/ocr/types';

// In-memory storage for OCR results
const ocrResultsStorage: Record<string, OCRResult> = {};

/**
 * Save OCR result to in-memory storage
 */
export function saveOCRResultToMemory(imageId: string, result: OCRResult): OCRResult {
  console.log('Saving OCR result to memory storage:', imageId);
  ocrResultsStorage[imageId] = { ...result };
  return ocrResultsStorage[imageId];
}

/**
 * Get OCR result from in-memory storage
 */
export function getOCRResultFromMemory(imageId: string): OCRResult | null {
  return ocrResultsStorage[imageId] || null;
}

/**
 * Get all OCR results from in-memory storage
 */
export function getAllOCRResultsFromMemory(): OCRResult[] {
  return Object.values(ocrResultsStorage);
}

/**
 * Clear all OCR results from in-memory storage
 */
export function clearOCRResultsMemory(): void {
  Object.keys(ocrResultsStorage).forEach(key => {
    delete ocrResultsStorage[key];
  });
}
