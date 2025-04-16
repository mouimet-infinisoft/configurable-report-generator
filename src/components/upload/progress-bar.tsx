'use client';

interface ProgressBarProps {
  progress: number;
  fileName: string;
  onCancel?: () => void;
}

export function ProgressBar({ progress, fileName, onCancel }: ProgressBarProps) {
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[80%]">
          {fileName}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
          {onCancel && (
            <button
              type="button"
              className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
              onClick={onCancel}
              aria-label="Cancel upload"
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
          )}
        </div>
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
