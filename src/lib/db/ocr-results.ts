import { supabase } from '@/lib/supabase';
import { OCRResult } from '@/lib/ocr/types';

export interface OCRResultRecord {
  id?: string;
  image_id: string;
  text: string;
  confidence: number;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  words?: any; // JSON data for words
  paragraphs?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Save OCR results to the database
 */
export async function saveOCRResult(imageId: string, result: OCRResult) {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session) {
    throw new Error('User must be authenticated to save OCR results');
  }

  const record: OCRResultRecord = {
    image_id: imageId,
    text: result.text,
    confidence: result.confidence,
    language: result.language || 'unknown',
    words: result.words,
    paragraphs: result.paragraphs,
  };

  const { data, error } = await supabase
    .from('ocr_results')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error saving OCR result:', error);
    throw error;
  }

  return data;
}

/**
 * Get OCR results for an image
 */
export async function getOCRResult(imageId: string) {
  const { data, error } = await supabase
    .from('ocr_results')
    .select('*')
    .eq('image_id', imageId)
    .single();

  if (error && error.code !== 'PGSQL_ERROR_NO_DATA') {
    console.error('Error getting OCR result:', error);
    throw error;
  }

  return data;
}

/**
 * Update OCR results for an image
 */
export async function updateOCRResult(id: string, updates: Partial<OCRResultRecord>) {
  const { data, error } = await supabase
    .from('ocr_results')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating OCR result:', error);
    throw error;
  }

  return data;
}

/**
 * Delete OCR results for an image
 */
export async function deleteOCRResult(id: string) {
  const { error } = await supabase
    .from('ocr_results')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting OCR result:', error);
    throw error;
  }

  return true;
}
