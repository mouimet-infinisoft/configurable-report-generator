'use client';

import React from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { EnhancementResult } from '@/lib/ai/text-enhancement';
import { PDFHeader } from './pdf-header';
import { PDFContent } from './pdf-content';
import { PDFFooter } from './pdf-footer';
import { PDFTableOfContents } from './pdf-table-of-contents';
import { PDFImagePage } from './pdf-image-page';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
});

interface PDFDocumentProps {
  enhancementResult: EnhancementResult;
  title: string;
  author?: string;
  date?: string;
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

export function PDFDocument({
  enhancementResult,
  title,
  author = '',
  date = new Date().toLocaleDateString(),
  paperSize = 'A4',
  orientation = 'portrait',
  showTableOfContents = false,
  showHeader = true,
  showFooter = true,
  imageAttachments = [],
  theme = {
    primaryColor: '#2c3e50',
    secondaryColor: '#3498db',
    fontFamily: 'Helvetica'
  }
}: PDFDocumentProps) {
  // Calculate total pages (1 for content + number of attachments)
  const totalPages = 1 + (imageAttachments?.length || 0);

  return (
    <Document>
      {/* Main content page */}
      <Page size={paperSize} orientation={orientation} style={styles.page}>
        {showHeader && <PDFHeader title={title} author={author} date={date} />}

        {showTableOfContents && enhancementResult.sections && enhancementResult.sections.length > 0 && (
          <PDFTableOfContents enhancementResult={enhancementResult} />
        )}

        <PDFContent enhancementResult={enhancementResult} />

        {showFooter && <PDFFooter pageNumber={1} totalPages={totalPages} />}
      </Page>

      {/* Image attachment pages */}
      {imageAttachments && imageAttachments.length > 0 &&
        imageAttachments.map((image, index) => (
          <PDFImagePage
            key={image.id}
            imageData={image.base64}
            imageIndex={index}
            totalImages={imageAttachments.length}
            pageNumber={index + 2} // Start from page 2
            totalPages={totalPages}
            showFooter={showFooter}
            paperSize={paperSize}
            orientation={orientation}
          />
        ))
      }
    </Document>
  );
}
