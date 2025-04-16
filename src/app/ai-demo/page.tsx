'use client';

import { useState } from 'react';
import { AIEnhancementToggle } from '@/components/ai/ai-enhancement-toggle';
import { enhanceText, isStreamingEnhancementAvailable } from '@/lib/ai/text-enhancement';

export default function AIDemo() {
  const [inputText, setInputText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useVercelAI, setUseVercelAI] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false);
  const [model, setModel] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to enhance');
      return;
    }

    setIsEnhancing(true);
    setError(null);
    setEnhancedText('');
    setModel(null);

    try {
      const result = await enhanceText(inputText, {
        language: 'french',
        reportType: 'driver-evaluation',
        useStreaming: useStreaming && isStreamingEnhancementAvailable()
      });

      setEnhancedText(result.enhancedText);
      setModel(result.model || 'Unknown');
    } catch (err) {
      console.error('Error enhancing text:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while enhancing the text');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Enhancement Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Input Text</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to enhance..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isEnhancing}
          />
          
          <AIEnhancementToggle
            onToggleVercelAI={setUseVercelAI}
            onToggleStreaming={setUseStreaming}
          />
          
          <button
            onClick={handleEnhance}
            disabled={isEnhancing || !inputText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnhancing ? 'Enhancing...' : 'Enhance Text'}
          </button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Enhanced Text</h2>
          {error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : isEnhancing ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900 rounded-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Enhancing text...</span>
            </div>
          ) : enhancedText ? (
            <div className="space-y-2">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md h-64 overflow-auto">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100">
                  {enhancedText}
                </pre>
              </div>
              {model && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Processed with: {model}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                Enhanced text will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
