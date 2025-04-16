import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type Image = Database['public']['Tables']['images']['Row'];
export type ImageInsert = Database['public']['Tables']['images']['Insert'];
export type ImageUpdate = Database['public']['Tables']['images']['Update'];

/**
 * Get all images for a report
 */
export async function getReportImages(reportId: string) {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at');

  if (error) {
    console.error('Error fetching report images:', error);
    return [];
  }

  return data;
}

/**
 * Get an image by ID
 */
export async function getImageById(id: string) {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching image:', error);
    return null;
  }

  return data;
}

/**
 * Create a new image record
 */
export async function createImage(image: ImageInsert) {
  const { data, error } = await supabase
    .from('images')
    .insert(image)
    .select()
    .single();

  if (error) {
    console.error('Error creating image record:', error);
    return { error };
  }

  return { data };
}

/**
 * Update an image record
 */
export async function updateImage(id: string, image: ImageUpdate) {
  const { data, error } = await supabase
    .from('images')
    .update(image)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating image record:', error);
    return { error };
  }

  return { data };
}

/**
 * Delete an image record
 */
export async function deleteImage(id: string) {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting image record:', error);
    return { error };
  }

  return { success: true };
}

/**
 * Upload an image to storage and create a record
 */
export async function uploadImage(file: File, reportId: string, ownerId: string) {
  // First upload the file to storage
  const filename = `${Date.now()}-${file.name}`;
  const storagePath = `${ownerId}/${reportId}/${filename}`;

  const { error: storageError } = await supabase.storage
    .from('images')
    .upload(storagePath, file);

  if (storageError) {
    console.error('Error uploading image to storage:', storageError);
    return { error: storageError };
  }

  // Then create a record in the images table
  const imageRecord: ImageInsert = {
    filename,
    storage_path: storagePath,
    mime_type: file.type,
    size: file.size,
    owner_id: ownerId,
    report_id: reportId
  };

  // If it's an image, try to get dimensions
  if (file.type.startsWith('image/')) {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        img.onload = () => {
          imageRecord.width = img.width;
          imageRecord.height = img.height;
          URL.revokeObjectURL(img.src);
          resolve();
        };
      });
    } catch (err) {
      console.error('Error getting image dimensions:', err instanceof Error ? err.message : err);
    }
  }

  const { data, error } = await createImage(imageRecord);

  if (error) {
    // If there was an error creating the record, delete the uploaded file
    await supabase.storage.from('images').remove([storagePath]);
    return { error };
  }

  return { data };
}

/**
 * Get a public URL for an image
 */
export async function getImageUrl(storagePath: string) {
  const { data } = await supabase.storage
    .from('images')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
