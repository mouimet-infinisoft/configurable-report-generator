'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileWithPreview } from './drag-drop-zone';

interface FilePreviewProps {
  files: FileWithPreview[];
  onRemove: (fileId: string) => void;
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemove = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    onRemove(fileId);
  };

  const toggleExpand = (fileId: string) => {
    setExpandedFile(expandedFile === fileId ? null : fileId);
  };

  const renderPreview = (file: FileWithPreview) => {
    if (file.type === 'application/pdf') {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded">
          <svg
            className="w-8 h-8 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      );
    }

    return (
      <Image
        src={file.preview}
        alt={file.name}
        fill
        className="object-cover rounded"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Selected Files ({files.length})</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-all ${
              expandedFile === file.id
                ? 'col-span-full row-span-2 h-96'
                : 'h-40'
            }`}
            onClick={() => toggleExpand(file.id)}
          >
            <div className="absolute inset-0">
              {renderPreview(file)}
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
            
            <button
              type="button"
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleRemove(e, file.id)}
              aria-label="Remove file"
            >
              <svg
                className="w-4 h-4"
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
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs">
              <div className="truncate">{file.name}</div>
              <div>{formatFileSize(file.size)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
