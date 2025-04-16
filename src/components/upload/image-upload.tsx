'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploadProps {
  onUpload: (images: string[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ onUpload, maxFiles = 10 }: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    
    // Convert files to data URLs
    const promises = acceptedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });
    
    // Process all files
    Promise.all(promises)
      .then(dataUrls => {
        const newImages = [...uploadedImages, ...dataUrls];
        setUploadedImages(newImages);
        onUpload(newImages);
      })
      .finally(() => {
        setIsUploading(false);
      });
  }, [uploadedImages, onUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles,
    disabled: isUploading
  });
  
  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    onUpload(newImages);
  };
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="text-gray-500 dark:text-gray-400">
            <p>Processing images...</p>
          </div>
        ) : isDragActive ? (
          <div className="text-blue-500 dark:text-blue-400">
            <p>Drop the images here...</p>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            <p>Drag & drop images here, or click to select files</p>
            <p className="text-sm mt-2">
              Supported formats: JPEG, PNG, GIF, BMP, WebP
            </p>
          </div>
        )}
      </div>
      
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    ×
                  </Button>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs text-gray-500 truncate">
                    Image {index + 1}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
