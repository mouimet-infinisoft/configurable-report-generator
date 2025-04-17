import { EnhancementResult } from '@/lib/ai/text-enhancement';
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
import { PDFDocument } from '@/components/pdf/pdf-document';
import React from 'react';

export interface PDFGenerationOptions {
  title?: string;
  author?: string;
  date?: string;
  logo?: string;
  paperSize?: 'A4' | 'LETTER' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
  showTableOfContents?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  imageAttachments?: Array<{
    id: string;
    base64: string;
  }>;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

/**
 * Generate a PDF blob from enhanced text using React-PDF
 */
export async function generatePDF(
  enhancementResult: EnhancementResult,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  console.log('PDF Generator called with result:', enhancementResult);

  const { title = 'Generated Report', author = '', date = new Date().toLocaleDateString() } = options;

  try {
    console.log('Creating PDF document with React-PDF...');

    // Create the PDF document
    const document = React.createElement(PDFDocument, {
      enhancementResult,
      title,
      author,
      date,
      paperSize: options.paperSize,
      orientation: options.orientation,
      showTableOfContents: options.showTableOfContents,
      showHeader: options.showHeader,
      showFooter: options.showFooter,
      imageAttachments: options.imageAttachments,
      theme: options.theme
    });

    // Generate the PDF blob
    console.log('Generating PDF blob...');
    const blob = await pdf(document).toBlob();
    console.log('PDF blob created successfully, size:', blob.size);

    return blob;
  } catch (error) {
    console.error('Error generating PDF with React-PDF:', error);

    // Fallback to simple HTML if React-PDF fails
    console.log('Falling back to HTML generation...');
    const errorHtml = `<html><body><h1>Error Generating PDF</h1><p>${error}</p></body></html>`;
    return new Blob([errorHtml], { type: 'text/html' });
  }
}
