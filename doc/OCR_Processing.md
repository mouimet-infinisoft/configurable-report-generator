# OCR Processing Documentation

This document provides detailed information about the OCR (Optical Character Recognition) processing functionality for the Configurable Report Generator application.

## Overview

The OCR processing system allows users to extract text from uploaded images. It supports multiple languages, provides progress tracking, and integrates with the report generation workflow.

## Components

### Tesseract.js Integration

The application uses Tesseract.js for OCR processing. Tesseract.js is a pure JavaScript port of the Tesseract OCR engine that runs entirely in the browser, making it ideal for client-side processing.

Key features:
- Client-side processing (no server required)
- Support for multiple languages
- High accuracy text recognition
- Progress tracking during processing

### OCR Service

The `tesseract-service.ts` file provides the core OCR functionality:

- `extractTextFromImage`: Processes a single image and extracts text
- `batchProcessImages`: Processes multiple images in sequence

### React Hook

The `useOCR` hook in `use-ocr.ts` provides a React interface for the OCR service:

- Manages processing state
- Tracks progress
- Handles errors
- Provides methods for processing images

### UI Components

- `LanguageSelector`: Allows users to select the OCR language
- `OCRProgress`: Displays processing progress
- `OCRResultView`: Shows the extracted text alongside the original image
- `OCRProcessor`: Combines all components into a complete OCR experience

## Database Integration

OCR results are stored in the database for future reference:

- The `ocr_results` table stores the extracted text and metadata
- Each result is linked to the image it was extracted from
- Results include confidence scores and word-level data

## Workflow

1. User uploads images to a report
2. User navigates to the OCR processing page
3. User selects the language and starts processing
4. The system processes each image and displays progress
5. Results are stored in the database
6. User can view and edit the extracted text
7. The extracted text can be used in the report

## Supported Languages

- English (`eng`)
- French (`fra`)
- English & French combined (`eng+fra`)

## Performance Considerations

- Processing is done entirely on the client side
- Large images may take longer to process
- PDF documents are processed page by page
- Language data is loaded dynamically to reduce initial load time

## Error Handling

The OCR system handles various error scenarios:

- Invalid image formats
- Processing failures
- Network issues when loading language data
- Low-quality images with poor text recognition

## Usage Example

```tsx
import { useOCR } from '@/lib/ocr/use-ocr';

function MyComponent() {
  const imageUrls = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
  
  const {
    results,
    isProcessing,
    progress,
    status,
    processImages,
  } = useOCR(imageUrls, { language: 'eng' });
  
  return (
    <div>
      <button onClick={() => processImages()} disabled={isProcessing}>
        Process Images
      </button>
      
      {isProcessing && (
        <div>
          <p>Status: {status}</p>
          <p>Progress: {progress}%</p>
        </div>
      )}
      
      {results.map((result, index) => (
        <div key={index}>
          <h3>Result {index + 1}</h3>
          <p>Confidence: {result.confidence}%</p>
          <pre>{result.text}</pre>
        </div>
      ))}
    </div>
  );
}
```

## Limitations

- OCR accuracy depends on image quality
- Processing large documents may be slow on less powerful devices
- Handwritten text recognition is limited
- Complex layouts may not be preserved in the extracted text

## Future Enhancements

Potential future enhancements to the OCR system:

1. **Improved Image Preprocessing**: Add client-side image enhancement for better OCR results
2. **Layout Analysis**: Preserve document structure and layout in the extracted text
3. **Table Recognition**: Add support for extracting tabular data
4. **Batch Processing Optimization**: Implement parallel processing for faster results
5. **Offline Support**: Add support for offline processing with cached language data
