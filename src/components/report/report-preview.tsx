'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { EnhancementResult } from '@/lib/ai/text-enhancement';
import { generatePDF, PDFGenerationOptions } from '@/lib/pdf/pdf-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportPreviewProps {
  enhancementResult: EnhancementResult;
  onBack: () => void;
}

export function ReportPreview({ enhancementResult, onBack }: ReportPreviewProps) {
  console.log('Report Preview component rendering with result:', enhancementResult);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('Generated Report');
  const [author, setAuthor] = useState('');
  const [paperSize, setPaperSize] = useState<'A4' | 'LETTER' | 'LEGAL'>('LETTER');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(false);

  // Check if there was an error in the enhancement process
  const hasError = !!enhancementResult.error;

  const handleGeneratePDF = async () => {
    console.log('Generating PDF...');
    setIsGenerating(true);

    try {
      const options: PDFGenerationOptions = {
        title,
        author,
        date: new Date().toLocaleDateString(),
        paperSize,
        orientation,
        showTableOfContents,
        showHeader,
        showFooter
      };

      console.log('Calling generatePDF with options:', options);
      const blob = await generatePDF(enhancementResult, options);
      console.log('PDF blob generated, size:', blob.size);

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      console.log('Triggering download...');
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDF Generated', {
        description: 'Your report has been generated and downloaded.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error Generating PDF', {
        description: 'There was an error generating the PDF. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to convert sections to markdown if they exist
  const getMarkdownContent = () => {
    if (enhancementResult.sections) {
      return enhancementResult.sections.map(section => {
        return `## ${section.title}\n\n${section.content}\n\n`;
      }).join('');
    }
    return enhancementResult.enhancedText;
  };

  // Get the markdown content
  const markdownContent = getMarkdownContent();

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

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="paperSize">Paper Size</Label>
              <select
                id="paperSize"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as 'A4' | 'LETTER' | 'LEGAL')}
                className="w-full p-2 border rounded-md"
              >
                <option value="LETTER">Letter</option>
                <option value="A4">A4</option>
                <option value="LEGAL">Legal</option>
              </select>
            </div>
            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <select
                id="orientation"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                className="w-full p-2 border rounded-md"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showHeader"
                checked={showHeader}
                onChange={(e) => setShowHeader(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="showHeader">Show Header</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showFooter"
                checked={showFooter}
                onChange={(e) => setShowFooter(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="showFooter">Show Footer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showTableOfContents"
                checked={showTableOfContents}
                onChange={(e) => setShowTableOfContents(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="showTableOfContents">Show Table of Contents</Label>
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

            {hasError && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                <p className="font-semibold">Note: There was an issue with AI enhancement</p>
                <p className="text-sm">{enhancementResult.error}</p>
                <p className="text-sm mt-1">A basic formatted version has been created instead.</p>
              </div>
            )}

            <Tabs defaultValue="formatted" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw Text</TabsTrigger>
              </TabsList>

              <TabsContent value="formatted" className="mt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
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
              </TabsContent>
            </Tabs>
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
