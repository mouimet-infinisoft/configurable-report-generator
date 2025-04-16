'use client';

import { useState } from 'react';
import { useOCR } from '@/lib/ocr/use-ocr';
import { OCRLanguage } from '@/lib/ocr/tesseract-service';
import { LanguageSelector } from './language-selector';
import { OCRProgress } from './ocr-progress';
import { OCRResultView } from './ocr-result-view';
import { saveOCRResult } from '@/lib/db/ocr-results';

interface OCRProcessorProps {
  images: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  onComplete?: () => void;
}

export function OCRProcessor({ images, onComplete }: OCRProcessorProps) {
  const [language, setLanguage] = useState<OCRLanguage>('eng');
  // Track which image is being processed
  const [, setCurrentImageIndex] = useState<number | null>(null);
  const [processedImages, setProcessedImages] = useState<string[]>([]);

  const imageUrls = images.map(img => img.url);

  const {
    results,
    isProcessing,
    progress,
    status,
    error,
    processImage,
    processImages,
    reset
  } = useOCR([], { language });

  // Process a single image
  const handleProcessSingle = async (index: number) => {
    if (isProcessing || !images[index]) return;

    setCurrentImageIndex(index);
    const result = await processImage(images[index].url);

    if (result) {
      try {
        // Save the OCR result to the database
        await saveOCRResult(images[index].id, result);

        // Mark this image as processed
        setProcessedImages(prev => [...prev, images[index].id]);
      } catch (err) {
        console.error('Error saving OCR result:', err);
      }
    }
  };

  // Process all images
  const handleProcessAll = async () => {
    if (isProcessing || images.length === 0) return;

    reset();
    const results = await processImages(imageUrls);

    // Save all results to the database
    if (results.length > 0) {
      try {
        for (let i = 0; i < results.length; i++) {
          if (results[i].text) {
            await saveOCRResult(images[i].id, results[i]);
            setProcessedImages(prev => [...prev, images[i].id]);
          }
        }

        if (onComplete) {
          onComplete();
        }
      } catch (err) {
        console.error('Error saving OCR results:', err);
      }
    }
  };

  // Cancel processing
  const handleCancel = () => {
    reset();
    setCurrentImageIndex(null);
  };

  // Handle text editing
  const handleEditText = async (index: number, text: string) => {
    if (!results[index]) return;

    try {
      // Create a new result with the edited text
      const editedResult = {
        ...results[index],
        text,
      };

      // Save the edited result to the database
      await saveOCRResult(images[index].id, editedResult);
    } catch (err) {
      console.error('Error saving edited OCR result:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          OCR Processing
        </h2>

        <div className="space-y-4">
          <LanguageSelector
            value={language}
            onChange={setLanguage}
            disabled={isProcessing}
          />

          {isProcessing && (
            <OCRProgress
              progress={progress}
              status={status}
              isProcessing={isProcessing}
            />
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleProcessAll}
              disabled={isProcessing || images.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process All Images ({images.length})
            </button>

            {isProcessing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image list for individual processing */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
          Images
        </h3>

        <div className="space-y-4">
          {images.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No images available for OCR processing.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="relative h-40">
                    {/* Use regular img tag for now to debug */}
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {image.name}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs">
                        {processedImages.includes(image.id) ? (
                          <span className="text-green-600 dark:text-green-400">
                            Processed
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Not processed
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleProcessSingle(index)}
                        disabled={isProcessing}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Process
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            OCR Results
          </h3>

          {results.map((result, index) => (
            <OCRResultView
              key={index}
              result={result}
              imageUrl={imageUrls[index]}
              onEdit={(text) => handleEditText(index, text)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
