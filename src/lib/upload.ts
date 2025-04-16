import { supabase } from '@/lib/supabase';
import { FileWithPreview } from '@/components/upload/drag-drop-zone';
import { createImage, ImageInsert } from '@/lib/db/images';

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
}

export interface UploadResult {
  fileId: string;
  success: boolean;
  error?: string;
  filePath?: string;
  fileUrl?: string;
}

export async function uploadFile(
  file: FileWithPreview,
  reportId: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${reportId}/${fileName}`;

    // Determine the bucket based on file type
    let bucket = 'images';
    if (file.type === 'application/pdf') {
      bucket = 'pdfs';
    }

    // Upload the file to Supabase Storage
    // Note: Supabase JS client doesn't support progress tracking directly
    // We'll simulate progress for better UX

    // Start progress at 0%
    if (onProgress) {
      onProgress({
        fileId: file.id,
        fileName: file.name,
        progress: 0,
      });
    }

    // Simulate 50% progress after a short delay
    setTimeout(() => {
      if (onProgress) {
        onProgress({
          fileId: file.id,
          fileName: file.name,
          progress: 50,
        });
      }
    }, 500);

    // Perform the actual upload
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    // Complete progress to 100%
    if (onProgress) {
      onProgress({
        fileId: file.id,
        fileName: file.name,
        progress: 100,
      });
    }

    if (error) {
      throw error;
    }

    // Get a signed URL for the file (since it's in a private bucket)
    const { data: urlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    // Create a record in the images table
    const imageRecord: Partial<ImageInsert> = {
      filename: file.name,
      storage_path: filePath,
      mime_type: file.type,
      size: file.size,
      owner_id: userId,
      report_id: reportId,
    };

    // If it's an image, try to get dimensions
    if (file.type.startsWith('image/')) {
      try {
        const img = new Image();
        img.src = file.preview;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            imageRecord.width = img.width;
            imageRecord.height = img.height;
            resolve();
          };
        });
      } catch (err) {
        console.error('Error getting image dimensions:', err);
      }
    }

    // Create the image record in the database
    const { error: imageError } = await createImage(imageRecord as ImageInsert);

    if (imageError) {
      throw imageError;
    }

    return {
      fileId: file.id,
      success: true,
      filePath,
      fileUrl: urlData?.signedUrl || '',
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      fileId: file.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload',
    };
  }
}
