'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { OCRProcessor } from '@/components/ocr/ocr-processor';
import { supabase } from '@/lib/supabase';

export default function OCRTestPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's images
  useEffect(() => {
    async function fetchImages() {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get images from the database
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get signed URLs for the images (since they're in a private bucket)
        const imagesWithUrls = await Promise.all(
          data.map(async (image) => {
            const bucket = image.mime_type.startsWith('image/') ? 'images' : 'pdfs';
            const { data: urlData } = await supabase.storage
              .from(bucket)
              .createSignedUrl(image.storage_path, 60 * 60); // 1 hour expiry

            return {
              id: image.id,
              url: urlData?.signedUrl || '',
              name: image.filename,
            };
          })
        );

        setImages(imagesWithUrls);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching images');
      } finally {
        setIsLoading(false);
      }
    }

    fetchImages();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-4">You need to be signed in to use OCR processing.</p>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OCR Processing Test</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading images...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
          <p>Error: {error}</p>
          <p className="mt-2">Please try refreshing the page.</p>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No Images Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to upload some images before you can use OCR processing.
          </p>
          <Link
            href="/upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload Images
          </Link>
        </div>
      ) : (
        <OCRProcessor
          images={images}
          onComplete={() => {
            // You could redirect or show a success message here
            console.log('OCR processing complete!');
          }}
        />
      )}

      <div className="mt-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
