'use client';

import { useState } from 'react';
import { OCRProcessor } from '@/components/ocr/ocr-processor';
import { ImageUpload } from '@/components/upload/image-upload';
import { OCRTextEditor } from '@/components/ocr/ocr-text-editor';
import { ReportPreview } from '@/components/report/report-preview';
import { enhanceText, EnhancementResult } from '@/lib/ai/text-enhancement';
import { OCRResult } from '@/lib/ocr/types';
import { saveOCRResult } from '@/lib/db/ocr-results';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function GenerateReportPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [images, setImages] = useState<string[]>([]);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleImagesUploaded = (uploadedImages: string[]) => {
    setImages(uploadedImages);
  };

  const handleOCRComplete = (results: OCRResult[]) => {
    if (results.length > 0) {
      setOcrResult(results[0]);
      setActiveTab('edit');
    }
  };

  const handleSaveText = async (text: string) => {
    if (!ocrResult) return;

    try {
      // Generate a unique ID for the image
      const imageId = `img-${Date.now()}`;

      // Save the edited OCR result to the database
      await saveOCRResult(imageId, {
        ...ocrResult,
        text
      });

      toast.success('Text saved', {
        description: 'The OCR text has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving OCR result:', error);
      toast.error('Error saving text', {
        description: 'There was an error saving the OCR text.',
      });
    }
  };

  const handleEnhanceText = async (text: string) => {
    setIsEnhancing(true);

    try {
      const result = await enhanceText(text, {
        language: ocrResult?.language || 'english',
      });

      setEnhancementResult(result);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error('Error enhancing text', {
        description: 'There was an error enhancing the text with AI.',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleBackToEditor = () => {
    setActiveTab('edit');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Generate Report</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="edit" disabled={!ocrResult}>Edit Text</TabsTrigger>
          <TabsTrigger value="preview" disabled={!enhancementResult}>Preview Report</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Upload Images
              </h2>
              <ImageUpload onUpload={handleImagesUploaded} />
            </div>

            {images.length > 0 && (
              <OCRProcessor
                images={images}
                onComplete={handleOCRComplete}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {ocrResult && (
            <OCRTextEditor
              result={ocrResult}
              onSave={handleSaveText}
              onEnhance={handleEnhanceText}
              isProcessing={isEnhancing}
            />
          )}

          <div className="mt-4">
            <Button variant="outline" onClick={() => setActiveTab('upload')}>
              Back to Upload
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {enhancementResult && (
            <ReportPreview
              enhancementResult={enhancementResult}
              onBack={handleBackToEditor}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
