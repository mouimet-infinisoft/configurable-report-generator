'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { UploadContainer } from '@/components/upload/upload-container';
import { UploadResult } from '@/lib/upload';
import { createReport } from '@/lib/db/reports';

export default function UploadPage() {
  const { user } = useAuth();
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a test report when needed
  const createTestReport = async () => {
    if (!user) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Create a properly formatted content object
      const reportContent = {
        sections: [
          {
            title: 'Test Report',
            content: 'This is a test report for image upload.'
          }
        ]
      };

      const { data, error } = await createReport({
        title: 'Test Report for Image Upload',
        content: reportContent,
        owner_id: user.id,
        status: 'draft',
      });

      if (error) {
        console.error('Supabase error creating report:', error);
        throw new Error(`Failed to create test report: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create test report: No data returned');
      }

      return data.id;
    } catch (err) {
      console.error('Error creating test report:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Note: We'll create the report on demand when the user clicks the button

  const handleUploadComplete = (results: UploadResult[]) => {
    setUploadResults(results);
    console.log('Upload complete:', results);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-4">You need to be signed in to upload files.</p>
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
      <h1 className="text-2xl font-bold mb-6">Upload Images</h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Drag & Drop Images</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload images for OCR processing. Supported formats: JPG, PNG, PDF.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Creating report...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
            <h3 className="font-medium">Error Creating Report</h3>
            <p className="mt-1">{error}</p>
            <p className="mt-2">Please check the console for more details and try again.</p>
            <button
              onClick={() => setError(null)}
              className="mt-3 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        ) : reportId ? (
          <UploadContainer
            reportId={reportId}
            onUploadComplete={handleUploadComplete}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              You need to create a report before uploading images.
            </p>
            <button
              onClick={async () => {
                const newReportId = await createTestReport();
                if (newReportId) {
                  setReportId(newReportId);
                }
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Test Report
            </button>
          </div>
        )}

        {uploadResults.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Upload Complete</h3>
            <p className="text-green-700 dark:text-green-400">
              {uploadResults.filter(r => r.success).length} of {uploadResults.length} files uploaded successfully.
            </p>
          </div>
        )}
      </div>

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
