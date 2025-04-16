'use client';

interface OCRProgressProps {
  progress: number;
  status: string;
  isProcessing: boolean;
}

export function OCRProgress({ progress, status, isProcessing }: OCRProgressProps) {
  // Format the status message to be more user-friendly
  const formatStatus = (status: string): string => {
    if (!isProcessing) return '';
    
    // Map Tesseract status messages to user-friendly messages
    const statusMap: Record<string, string> = {
      'loading tesseract core': 'Loading OCR engine...',
      'initializing tesseract': 'Initializing OCR engine...',
      'loading language traineddata': 'Loading language data...',
      'initializing api': 'Preparing OCR engine...',
      'recognizing text': 'Recognizing text...',
      'completed': 'Processing complete!',
    };
    
    // Check if the status contains any of the keys in the map
    for (const key in statusMap) {
      if (status.includes(key)) {
        return statusMap[key];
      }
    }
    
    // If no match is found, return the original status
    return status;
  };
  
  const formattedStatus = formatStatus(status);
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formattedStatus}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
