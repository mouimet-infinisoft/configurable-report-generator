# Mistral OCR Integration

This document describes the integration of Mistral's Pixtral model for OCR (Optical Character Recognition) into the Configurable Report Generator application.

## Overview

The Mistral OCR integration provides advanced OCR capabilities using Mistral's Pixtral model, which is specifically designed for vision tasks. This implementation leverages the Vercel AI SDK to interact with Mistral's API, providing a seamless experience for extracting text from images.

## Architecture

The integration follows a client-server architecture:

1. **Client Component**: Handles image uploads and displays the extracted text
2. **API Route**: Processes the image using Mistral's Pixtral model
3. **Vercel AI SDK**: Provides the interface to interact with Mistral's API

## Components

### API Route

Located in `src/app/api/ocr/mistral/route.ts`, this route handles the OCR processing:

- Receives an image and optional prompt from the client
- Uses the Mistral provider from Vercel AI SDK to process the image
- Returns the extracted text and model information

### Client Component

Located in `src/components/ocr/mistral-ocr.tsx`, this component provides the user interface:

- Allows users to upload images
- Displays the uploaded image
- Sends the image to the API route for processing
- Displays the extracted text

### Demo Page

Located in `src/app/mistral-ocr/page.tsx`, this page showcases the Mistral OCR functionality.

## Usage

### Environment Variables

Add the following to your `.env.local` file:

```
# Mistral AI configuration
MISTRAL_AI_API_KEY=your-mistral-api-key
```

### Client-Side Usage

1. Navigate to the Mistral OCR demo page at `/mistral-ocr`
2. Upload an image using the "Select Image" button
3. Click "Extract Text" to process the image
4. View the extracted text in the result area

## Benefits of Mistral Pixtral for OCR

1. **High Accuracy**: Pixtral is specifically designed for vision tasks and provides excellent OCR capabilities
2. **Multilingual Support**: It can handle text in multiple languages, including French
3. **Document Understanding**: Beyond simple OCR, it can understand document structure and context
4. **Formatting Preservation**: It can preserve the formatting of the extracted text
5. **Handwritten Text Recognition**: Better at recognizing handwritten text compared to traditional OCR solutions

## Limitations

1. **API Key Required**: Requires a valid Mistral API key
2. **Rate Limits**: Subject to Mistral's API rate limits
3. **Image Size**: Limited to images under 10MB

## Future Improvements

1. **Batch Processing**: Add support for processing multiple images at once
2. **Document Understanding**: Enhance the implementation to support document understanding capabilities
3. **Structured Output**: Add support for extracting structured data from images
4. **Integration with Report Generation**: Integrate OCR results directly into report templates
