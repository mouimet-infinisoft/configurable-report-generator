import { supabase } from '@/lib/supabase';
import { OCRResult } from '@/lib/ocr/types';

export interface TempOCRResultRecord {
  id?: string;
  image_id: string;
  text: string;
  confidence: number;
  language: string;
  words?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>; // JSON data for words
  paragraphs?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Save OCR results to the temporary database table
 * This doesn't require a valid UUID reference to the images table
 */
export async function saveTempOCRResult(imageId: string, result: OCRResult) {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session) {
    throw new Error('User must be authenticated to save OCR results');
  }

  const record: TempOCRResultRecord = {
    image_id: imageId,
    text: result.text,
    confidence: result.confidence,
    language: result.language || 'unknown',
    words: result.words,
    paragraphs: result.paragraphs,
  };

  const { data, error } = await supabase
    .from('temp_ocr_results')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error saving temporary OCR result:', JSON.stringify(error, null, 2));
    console.error('Record attempted to save:', JSON.stringify(record, null, 2));
    // Don't throw the error, just log it and return null
    return null;
  }

  return data;
}

/**
 * Get temporary OCR results for an image
 */
export async function getTempOCRResult(imageId: string) {
  const { data, error } = await supabase
    .from('temp_ocr_results')
    .select('*')
    .eq('image_id', imageId)
    .single();

  if (error && error.code !== 'PGSQL_ERROR_NO_DATA') {
    console.error('Error getting temporary OCR result:', error);
    throw error;
  }

  return data;
}

/**
 * Update temporary OCR results
 */
export async function updateTempOCRResult(id: string, updates: Partial<TempOCRResultRecord>) {
  const { data, error } = await supabase
    .from('temp_ocr_results')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating temporary OCR result:', error);
    throw error;
  }

  return data;
}
