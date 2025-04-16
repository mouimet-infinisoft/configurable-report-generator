'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { DragDropZone, FileWithPreview } from './drag-drop-zone';
import { FilePreview } from './file-preview';
import { ProgressBar } from './progress-bar';
import { uploadFile, UploadProgress, UploadResult } from '@/lib/upload';

interface UploadContainerProps {
  reportId: string;
  onUploadComplete?: (results: UploadResult[]) => void;
}

export function UploadContainer({ reportId, onUploadComplete }: UploadContainerProps) {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const handleFilesSelected = useCallback((files: FileWithPreview[]) => {
    setSelectedFiles((prevFiles) => {
      // Filter out duplicates based on name and size
      const existingFileNames = new Set(prevFiles.map((f) => `${f.name}-${f.size}`));
      const newFiles = files.filter(
        (file) => !existingFileNames.has(`${file.name}-${file.size}`)
      );
      return [...prevFiles, ...newFiles];
    });
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    
    // Also remove from progress and results if present
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    
    setUploadResults((prev) => prev.filter((result) => result.fileId !== fileId));
  }, []);

  const handleUploadProgress = useCallback((progress: UploadProgress) => {
    setUploadProgress((prev) => ({
      ...prev,
      [progress.fileId]: progress,
    }));
  }, []);

  const handleUpload = async () => {
    if (!user || selectedFiles.length === 0 || isUploading) return;
    
    setIsUploading(true);
    setUploadResults([]);
    
    const results: UploadResult[] = [];
    
    // Upload files sequentially to avoid overwhelming the server
    for (const file of selectedFiles) {
      const result = await uploadFile(
        file,
        reportId,
        user.id,
        handleUploadProgress
      );
      
      results.push(result);
      
      // Update results as they come in
      setUploadResults((prev) => [...prev, result]);
    }
    
    setIsUploading(false);
    
    // Call the onUploadComplete callback with the results
    if (onUploadComplete) {
      onUploadComplete(results);
    }
  };

  const handleClearAll = () => {
    // Only allow clearing if not currently uploading
    if (!isUploading) {
      setSelectedFiles([]);
      setUploadProgress({});
      setUploadResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <DragDropZone
        onFilesSelected={handleFilesSelected}
        className={isUploading ? 'opacity-50 pointer-events-none' : ''}
      />
      
      <FilePreview
        files={selectedFiles}
        onRemove={handleRemoveFile}
      />
      
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          {Object.values(uploadProgress).map((progress) => (
            <ProgressBar
              key={progress.fileId}
              progress={progress.progress}
              fileName={progress.fileName}
            />
          ))}
          
          <div className="flex justify-between">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleClearAll}
              disabled={isUploading}
            >
              Clear All
            </button>
            
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
          
          {uploadResults.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Upload Results</h3>
              <ul className="mt-2 space-y-2">
                {uploadResults.map((result) => (
                  <li key={result.fileId} className="flex items-center">
                    {result.success ? (
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-red-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedFiles.find(f => f.id === result.fileId)?.name}:
                      {result.success ? ' Uploaded successfully' : ` Error: ${result.error}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
