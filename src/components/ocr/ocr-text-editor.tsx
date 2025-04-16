'use client';

import { useState, useEffect } from 'react';
import { OCRResult } from '@/lib/ocr/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface OCRTextEditorProps {
  result: OCRResult;
  onSave: (text: string) => void;
  onEnhance: (text: string) => void;
  isProcessing?: boolean;
}

export function OCRTextEditor({
  result,
  onSave,
  onEnhance,
  isProcessing = false
}: OCRTextEditorProps) {
  const [text, setText] = useState('');

  // Update text when result changes
  useEffect(() => {
    console.log('OCR result received in editor:', result);
    if (result?.text) {
      console.log('Setting text from result, length:', result.text.length);
      setText(result.text);
    } else {
      console.log('No text in OCR result, using default text');
      setText('No text was extracted from the image. You can manually enter text here.');
    }
  }, [result]);

  const handleSave = () => {
    onSave(text);
  };

  const handleEnhance = () => {
    onEnhance(text);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>OCR Text Editor</span>
          {result.processedWithAI && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded-full">
              Processed with AI
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px] font-mono"
          placeholder="OCR extracted text will appear here. You can edit it before enhancing or saving."
          disabled={isProcessing}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isProcessing || !text}
        >
          Save Text
        </Button>
        <Button
          onClick={handleEnhance}
          disabled={isProcessing || !text}
        >
          Enhance with AI
        </Button>
      </CardFooter>
    </Card>
  );
}
