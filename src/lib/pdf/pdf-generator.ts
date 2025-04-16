import { EnhancementResult } from '@/lib/ai/text-enhancement';

export interface PDFGenerationOptions {
  title?: string;
  author?: string;
  date?: string;
  logo?: string;
}

/**
 * Generate a PDF blob from enhanced text
 */
export async function generatePDF(
  enhancementResult: EnhancementResult,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  console.log('PDF Generator called with result:', enhancementResult);
  // In a real implementation, we would use React-PDF to generate the PDF
  // For the MVP, we'll use a simple approach with browser APIs

  const { title = 'Generated Report', author = '', date = new Date().toLocaleDateString() } = options;

  // Create HTML content for the PDF
  console.log('Creating HTML content with options:', { title, author, date });
  const htmlContent = createHTMLContent(enhancementResult, { title, author, date });
  console.log('HTML content created, length:', htmlContent.length);

  try {
    // For MVP, we'll just return a simple blob directly
    // This is more reliable than using iframes
    console.log('Creating blob directly from HTML content...');
    const blob = new Blob([htmlContent], { type: 'text/html' });
    console.log('Blob created successfully, size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Return a simple error message as blob
    const errorHtml = `<html><body><h1>Error Generating PDF</h1><p>${error}</p></body></html>`;
    return new Blob([errorHtml], { type: 'text/html' });
  }
}

/**
 * Create HTML content for the PDF
 */
function createHTMLContent(
  enhancementResult: EnhancementResult,
  options: { title: string; author: string; date: string }
): string {
  const { title, author, date } = options;
  const { enhancedText, sections } = enhancementResult;

  let content = '';

  // If we have parsed sections, use them
  if (sections && sections.length > 0) {
    content = sections.map(section => `
      <div class="section">
        <h2>${section.title}</h2>
        <div>${section.content.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');
  } else {
    // Otherwise use the raw enhanced text
    content = `<div>${enhancedText.replace(/\n/g, '<br>')}</div>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        .title {
          font-size: 24px;
          margin-bottom: 5px;
        }
        .meta {
          font-size: 14px;
          color: #666;
        }
        .section {
          margin-bottom: 20px;
        }
        h2 {
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${title}</div>
        <div class="meta">
          ${author ? `Author: ${author} | ` : ''}
          Date: ${date}
        </div>
      </div>
      <div class="content">
        ${content}
      </div>
    </body>
    </html>
  `;
}
