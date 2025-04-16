'use client';

import { useState, useEffect } from 'react';
import { useOCR } from '@/lib/ocr/use-ocr';
import { OCRLanguage, OCRResult } from '@/lib/ocr/types';
import { LanguageSelector } from './language-selector';
import { OCRProgress } from './ocr-progress';
import { OCRResultView } from './ocr-result-view';
import { saveOCRResultToMemory } from '@/lib/ocr/memory-storage';

interface OCRProcessorProps {
  images: string[] | Array<{
    id: string;
    url: string;
    name: string;
  }>;
  onComplete?: (results: OCRResult[]) => void;
  onImagesUploaded?: (images: string[]) => void;
}

export function OCRProcessor({ images, onComplete, onImagesUploaded }: OCRProcessorProps) {
  const [language, setLanguage] = useState<OCRLanguage>('fra');
  const [useAI, setUseAI] = useState<boolean>(true);
  // Track which image is being processed
  const [, setCurrentImageIndex] = useState<number | null>(null);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [formattedImages, setFormattedImages] = useState<Array<{
    id: string;
    url: string;
    name: string;
  }>>([]);

  // Format images to consistent structure
  useEffect(() => {
    if (Array.isArray(images)) {
      if (images.length > 0) {
        if (typeof images[0] === 'string') {
          // Convert string[] to formatted structure
          const formatted = (images as string[]).map((url, index) => ({
            id: `img-${index}`,
            url,
            name: `Image ${index + 1}`
          }));
          setFormattedImages(formatted);

          // Notify parent of uploaded images
          if (onImagesUploaded) {
            onImagesUploaded(images as string[]);
          }
        } else {
          // Already in correct format
          setFormattedImages(images as Array<{
            id: string;
            url: string;
            name: string;
          }>);
        }
      } else {
        setFormattedImages([]);
      }
    }
  }, [images, onImagesUploaded]);

  const imageUrls = formattedImages.map(img => img.url);

  const {
    results,
    isProcessing,
    progress,
    status,
    error,
    processImage,
    processImages,
    reset
  } = useOCR([], { language, preferAI: useAI });

  // Process a single image
  const handleProcessSingle = async (index: number) => {
    if (isProcessing || !formattedImages[index]) return;

    setCurrentImageIndex(index);
    const result = await processImage(formattedImages[index].url);

    if (result) {
      try {
        // Save the OCR result to memory storage
        saveOCRResultToMemory(formattedImages[index].id, result);

        // Mark this image as processed
        setProcessedImages(prev => [...prev, formattedImages[index].id]);
      } catch (err) {
        console.error('Error saving OCR result:', err);
      }
    }
  };

  // Process all images
  const handleProcessAll = async () => {
    console.log('Processing all images...');
    if (isProcessing || formattedImages.length === 0) {
      console.log('Cannot process: isProcessing =', isProcessing, 'formattedImages.length =', formattedImages.length);
      return;
    }

    reset();
    console.log('Processing images with URLs:', imageUrls);
    const results = await processImages(imageUrls);
    console.log('OCR results received:', results.length);

    // Save all results to memory storage
    if (results.length > 0) {
      console.log('Saving OCR results to memory storage...');
      try {
        for (let i = 0; i < results.length; i++) {
          console.log(`Processing result ${i+1}/${results.length}, has text:`, !!results[i].text);
          if (results[i].text) {
            saveOCRResultToMemory(formattedImages[i].id, results[i]);
            setProcessedImages(prev => [...prev, formattedImages[i].id]);
            console.log(`Saved result ${i+1} with ID:`, formattedImages[i].id);
          }
        }

        if (onComplete) {
          console.log('Calling onComplete with results:', results.length);
          onComplete(results);
        } else {
          console.log('No onComplete callback provided');
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

      // Save the edited result to memory storage
      saveOCRResultToMemory(formattedImages[index].id, editedResult);
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

          <div className="flex items-center space-x-2 mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Use AI for handwritten text
            </label>
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              disabled={isProcessing}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            {useAI && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Recommended for handwritten French text
              </span>
            )}
          </div>

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
              disabled={isProcessing || formattedImages.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process All Images ({formattedImages.length})
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
          {formattedImages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No images available for OCR processing.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formattedImages.map((image, index) => (
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
