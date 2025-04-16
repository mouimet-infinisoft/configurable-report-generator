'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { UploadContainer } from '@/components/upload/upload-container';
import { UploadResult } from '@/lib/upload';
import { createReport } from '@/lib/db/reports';

export default function NewReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [reportId, setReportId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateReport = async () => {
    if (!user || !title.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      const { data, error } = await createReport({
        title: title.trim(),
        content: {},
        owner_id: user.id,
        status: 'draft',
      });

      if (error) throw error;
      if (!data) throw new Error('Failed to create report');

      setReportId(data.id);
    } catch (err) {
      console.error('Error creating report:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the report');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadComplete = (results: UploadResult[]) => {
    // Check if all uploads were successful
    const allSuccessful = results.every(result => result.success);

    if (allSuccessful) {
      // Wait a moment before redirecting to allow the user to see the success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-4">You need to be signed in to create reports.</p>
          <a
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Report</h1>

      {!reportId ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Report Details</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter report title"
              />
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleCreateReport}
                disabled={!title.trim() || isCreating}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Report'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Images for &quot;{title}&quot;</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload images for OCR processing. Supported formats: JPG, PNG, PDF.
          </p>

          <UploadContainer
            reportId={reportId}
            onUploadComplete={handleUploadComplete}
          />
        </div>
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
