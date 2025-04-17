'use client';

import React from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { EnhancementResult } from '@/lib/ai/text-enhancement';
import { PDFHeader } from './pdf-header';
import { PDFContent } from './pdf-content';
import { PDFFooter } from './pdf-footer';
import { PDFTableOfContents } from './pdf-table-of-contents';

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
  theme = {
    primaryColor: '#2c3e50',
    secondaryColor: '#3498db',
    fontFamily: 'Helvetica'
  }
}: PDFDocumentProps) {
  // For simplicity, we're using a single page approach for now
  // In a more advanced implementation, we could split content across multiple pages
  // based on content length and page breaks
  return (
    <Document>
      <Page size={paperSize} orientation={orientation} style={styles.page}>
        {showHeader && <PDFHeader title={title} author={author} date={date} />}

        {showTableOfContents && enhancementResult.sections && enhancementResult.sections.length > 0 && (
          <PDFTableOfContents enhancementResult={enhancementResult} />
        )}

        <PDFContent enhancementResult={enhancementResult} />

        {showFooter && <PDFFooter pageNumber={1} totalPages={1} />}
      </Page>
    </Document>
  );
}
