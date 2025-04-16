'use client';

import { useState, useRef, useCallback } from 'react';

// Define accepted file types
export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
};

// Define maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type FileWithPreview = File & {
  preview: string;
  id: string;
};

interface DragDropZoneProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  className?: string;
}

export function DragDropZone({
  onFilesSelected,
  maxFiles = 10,
  className = '',
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const fileType = file.type;
    const isValidType = Object.keys(ACCEPTED_FILE_TYPES).includes(fileType);
    if (!isValidType) {
      return {
        valid: false,
        error: `File type not supported. Accepted types: ${Object.values(ACCEPTED_FILE_TYPES)
          .flat()
          .join(', ')}`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    return { valid: true };
  };

  const processFiles = useCallback(
    (fileList: FileList) => {
      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      // Convert FileList to array and process
      Array.from(fileList).forEach((file) => {
        const validation = validateFile(file);
        if (validation.valid) {
          // Create a preview URL for the file
          const preview = URL.createObjectURL(file);
          validFiles.push(Object.assign(file, { preview, id: crypto.randomUUID() }));
        } else if (validation.error) {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });

      // Check if we have too many files
      if (validFiles.length > maxFiles) {
        errors.push(`You can only upload a maximum of ${maxFiles} files at once.`);
        // Truncate the valid files to the maximum allowed
        validFiles.splice(maxFiles);
      }

      // Display errors if any
      if (errors.length > 0) {
        console.error('File validation errors:', errors);
        alert(`Some files couldn't be added:\n${errors.join('\n')}`);
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [maxFiles, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        // Reset the input value so the same file can be selected again
        e.target.value = '';
      }
    },
    [processFiles]
  );

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
      } ${className}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.entries(ACCEPTED_FILE_TYPES)
          .map(([mimeType, exts]) => [mimeType, ...exts])
          .flat()
          .join(',')}
        className="hidden"
        onChange={handleFileInputChange}
        aria-label="File upload"
      />

      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          or <button type="button" className="text-blue-600 hover:underline" onClick={handleButtonClick}>browse files</button>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supported formats: JPG, PNG, PDF (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
        </p>
      </div>
    </div>
  );
}
