'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { X, Trash2 } from 'lucide-react';
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
  const [attachedImages, setAttachedImages] = useState<Array<{
    id: string;
    file: File;
    previewUrl: string;
  }>>([]);

  // Check if there was an error in the enhancement process
  const hasError = !!enhancementResult.error;

  // Cleanup function to revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      attachedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [attachedImages]);

  // Handle image attachment
  const handleImageAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file)
      }));

      setAttachedImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} attached`);
    }
  };

  // Remove a single attachment
  const removeAttachment = (id: string) => {
    setAttachedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Revoke object URLs for removed images to prevent memory leaks
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  // Clear all attachments
  const clearAllAttachments = () => {
    // Revoke all object URLs to prevent memory leaks
    attachedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setAttachedImages([]);
    if (attachedImages.length > 0) {
      toast.info('All attachments cleared');
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleGeneratePDF = async () => {
    console.log('Generating PDF...');
    setIsGenerating(true);

    try {
      // Convert attached images to base64 for PDF generation
      let imageAttachments = [];
      if (attachedImages.length > 0) {
        toast.info(`Processing ${attachedImages.length} image attachments...`);
        imageAttachments = await Promise.all(
          attachedImages.map(async (img) => {
            return {
              id: img.id,
              base64: await fileToBase64(img.file)
            };
          })
        );
      }

      const options: PDFGenerationOptions = {
        title,
        author,
        date: new Date().toLocaleDateString(),
        paperSize,
        orientation,
        showTableOfContents,
        showHeader,
        showFooter,
        imageAttachments
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

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Image Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="image-upload">Attach Images</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageAttachment}
                  multiple
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Images will be attached as separate pages at the end of the PDF.
                </p>
              </div>

              {attachedImages.length > 0 && (
                <div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {attachedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.previewUrl}
                          alt="Attachment preview"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachment(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={clearAllAttachments}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Clear All Attachments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
