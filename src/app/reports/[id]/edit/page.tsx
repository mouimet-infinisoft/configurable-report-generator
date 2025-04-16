'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { getReport } from '@/lib/db/reports';
import { supabase } from '@/lib/supabase';
import { getOCRResult } from '@/lib/db/ocr-results';

// Use the useParams hook from next/navigation instead of props
// This is a client component, so we can use hooks

export default function ReportEditPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();

  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [images, setImages] = useState<Array<Record<string, unknown>>>([]);
  const [ocrResults, setOcrResults] = useState<Record<string, Record<string, unknown>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch report, images, and OCR results
  useEffect(() => {
    async function fetchData() {
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
              ...image,
              url: urlData?.signedUrl || '',
            };
          })
        );

        setImages(imagesWithUrls);

        // Get OCR results for each image
        const results: Record<string, Record<string, unknown>> = {};

        for (const image of imagesWithUrls) {
          try {
            const ocrResult = await getOCRResult(image.id);
            if (ocrResult) {
              results[image.id] = ocrResult;
            }
          } catch (err) {
            console.error(`Error fetching OCR result for image ${image.id}:`, err);
          }
        }

        setOcrResults(results);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, reportId]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-4">You need to be signed in to edit reports.</p>
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
        <h1 className="text-2xl font-bold">Edit Report</h1>
        {report && (
          <span className="text-gray-600 dark:text-gray-400">
            {report.title as string}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading report...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
          <p>Error: {error}</p>
          <p className="mt-2">Please try refreshing the page.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/reports/${reportId}/upload`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Upload Images
              </Link>
              <Link
                href={`/reports/${reportId}/ocr`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                OCR Processing
              </Link>
            </div>
          </div>

          {/* OCR Results */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">OCR Results</h2>

            {images.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No images have been uploaded to this report yet.
              </p>
            ) : Object.keys(ocrResults).length === 0 ? (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No OCR results found. Process your images to extract text.
                </p>
                <Link
                  href={`/reports/${reportId}/ocr`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Process Images
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {images.map((image) => (
                  <div key={image.id as string} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/3">
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded">
                          {/* Use regular img tag for now to debug */}
                          <img
                            src={image.url as string}
                            alt={image.filename as string}
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                          {image.filename as string}
                        </p>
                      </div>

                      <div className="w-full md:w-2/3">
                        {ocrResults[image.id as string] ? (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">Extracted Text</h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Confidence: {Math.round(ocrResults[image.id as string].confidence as number)}%
                              </span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md h-40 overflow-auto">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-gray-200">
                                {ocrResults[image.id as string].text as string || 'No text extracted'}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 dark:text-gray-400">
                              No OCR results for this image
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
