'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { UploadContainer } from '@/components/upload/upload-container';
import { UploadResult } from '@/lib/upload';
import { getReport } from '@/lib/db/reports';

// Use the useParams hook from next/navigation instead of props
// This is a client component, so we can use hooks

export default function ReportUploadPage() {
  const params = useParams();
  const reportId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  // Fetch the report
  useEffect(() => {
    async function fetchReport() {
      if (!user || !reportId) return;

      try {
        setIsLoading(true);
        setError(null);

        const reportData = await getReport(reportId);
        if (!reportData) {
          throw new Error('Report not found');
        }

        setReport(reportData);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [user, reportId]);

  const handleUploadComplete = (results: UploadResult[]) => {
    setUploadResults(results);

    // Check if all uploads were successful
    const allSuccessful = results.every(result => result.success);

    if (allSuccessful) {
      // Wait a moment before redirecting to allow the user to see the success message
      setTimeout(() => {
        router.push(`/reports/${reportId}/ocr`);
      }, 2000);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-4">You need to be signed in to upload images.</p>
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
        <h1 className="text-2xl font-bold">Upload Images</h1>
        {report && (
          <span className="text-gray-600 dark:text-gray-400">
            Report: {report.title as string}
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Drag & Drop Images</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload images for OCR processing. Supported formats: JPG, PNG, PDF.
          </p>

          <UploadContainer
            reportId={reportId}
            onUploadComplete={handleUploadComplete}
          />

          {uploadResults.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Upload Complete</h3>
              <p className="text-green-700 dark:text-green-400">
                {uploadResults.filter(r => r.success).length} of {uploadResults.length} files uploaded successfully.
              </p>
              <div className="mt-2">
                <Link
                  href={`/reports/${reportId}/ocr`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Proceed to OCR Processing →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <Link
          href={`/reports/${reportId}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Report
        </Link>
      </div>
    </div>
  );
}
