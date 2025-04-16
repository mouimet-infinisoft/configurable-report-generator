'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export function MistralOCR() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const processImage = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ocr/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          prompt: 'Extract all text from this image and preserve the formatting'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }
      
      setResult(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Mistral Pixtral OCR</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Upload an image to extract text using Mistral's Pixtral model
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Select Image
          </label>
          {image && (
            <span className="ml-2 text-sm text-gray-500">Image selected</span>
          )}
        </div>
        
        {image && (
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <img
                src={image}
                alt="Uploaded image"
                className="max-h-64 mx-auto"
              />
            </div>
            
            <Button
              onClick={processImage}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Extract Text'}
            </Button>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Extracted Text</h3>
            <Textarea
              value={result}
              readOnly
              className="min-h-[200px] font-mono"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
