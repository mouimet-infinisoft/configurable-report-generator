'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { OCRProcessor } from '@/components/ocr/ocr-processor';
import { supabase } from '@/lib/supabase';
import { getReport } from '@/lib/db/reports';

// Use the useParams hook from next/navigation instead of props
// This is a client component, so we can use hooks

export default function OCRPage() {
  const params = useParams();
  const reportId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [images, setImages] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch report and its images
  useEffect(() => {
    async function fetchReportAndImages() {
      if (!user || !reportId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get the report
        const reportData = await getReport(reportId);
        if (!reportData) {
          throw new Error('Report not found');
        }

        setReport(reportData);

        // Get images for this report
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('*')
          .eq('report_id', reportId)
          .order('created_at', { ascending: false });

        if (imageError) throw imageError;

        // Get signed URLs for the images (since they're in a private bucket)
        const imagesWithUrls = await Promise.all(
          imageData.map(async (image) => {
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
        console.error('Error fetching report and images:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReportAndImages();
  }, [user, reportId]);

  const handleProcessingComplete = () => {
    // Redirect to the report edit page
    router.push(`/reports/${reportId}/edit`);
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">OCR Processing</h1>
        {report && (
          <span className="text-gray-600 dark:text-gray-400">
            Report: {report.title as string}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
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
            You need to upload some images to this report before you can use OCR processing.
          </p>
          <Link
            href={`/reports/${reportId}/upload`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload Images
          </Link>
        </div>
      ) : (
        <OCRProcessor
          images={images}
          onComplete={handleProcessingComplete}
        />
      )}

      <div className="mt-8 flex space-x-4">
        <Link
          href={`/reports/${reportId}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Report
        </Link>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
