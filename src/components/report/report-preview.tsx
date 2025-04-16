'use client';

import { useState } from 'react';
import { EnhancementResult } from '@/lib/ai/text-enhancement';
import { generatePDF, PDFGenerationOptions } from '@/lib/pdf/pdf-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReportPreviewProps {
  enhancementResult: EnhancementResult;
  onBack: () => void;
}

export function ReportPreview({ enhancementResult, onBack }: ReportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('Generated Report');
  const [author, setAuthor] = useState('');
  
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const options: PDFGenerationOptions = {
        title,
        author,
        date: new Date().toLocaleDateString()
      };
      
      const blob = await generatePDF(enhancementResult, options);
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter report title"
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>
          
          <div className="border rounded-md p-4 bg-white dark:bg-gray-950">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="text-sm text-gray-500">
                {author && <span>By {author} | </span>}
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            {enhancementResult.sections ? (
              <div className="space-y-4">
                {enhancementResult.sections.map((section, index) => (
                  <div key={index} className="mb-4">
                    <h2 className="text-xl font-semibold border-b pb-1 mb-2">{section.title}</h2>
                    <div className="whitespace-pre-line">{section.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="whitespace-pre-line">{enhancementResult.enhancedText}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Editor
          </Button>
          <Button 
            onClick={handleGeneratePDF}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
