'use client';

import { useState } from 'react';
import { OCRResult } from '@/lib/ocr/tesseract-service';

interface OCRResultViewProps {
  result: OCRResult;
  imageUrl: string;
  onEdit?: (text: string) => void;
}

export function OCRResultView({ result, imageUrl, onEdit }: OCRResultViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(result.text);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'text-only' | 'image-only'>('side-by-side');

  const handleSave = () => {
    if (onEdit) {
      onEdit(editedText);
    }
    setIsEditing(false);
  };

  const renderConfidenceIndicator = () => {
    const confidence = result.confidence;
    let color = 'bg-red-500';
    let label = 'Low';

    if (confidence >= 90) {
      color = 'bg-green-500';
      label = 'High';
    } else if (confidence >= 75) {
      color = 'bg-yellow-500';
      label = 'Medium';
    }

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label} confidence ({confidence.toFixed(1)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            OCR Result
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Side by Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode('text-only')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'text-only'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Text Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode('image-only')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'image-only'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Image Only
            </button>
          </div>
        </div>
        {renderConfidenceIndicator()}
      </div>

      <div className={`p-4 ${viewMode === 'side-by-side' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
        {(viewMode === 'side-by-side' || viewMode === 'image-only') && (
          <div className="relative h-64 md:h-auto">
            {/* Use regular img tag for now to debug */}
            <img
              src={imageUrl}
              alt="Original image"
              className="object-contain w-full h-full"
            />
          </div>
        )}

        {(viewMode === 'side-by-side' || viewMode === 'text-only') && (
          <div className="h-64 md:h-auto overflow-auto">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditedText(result.text);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 p-2">
                  {result.text || 'No text detected'}
                </pre>
                {onEdit && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit Text
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
