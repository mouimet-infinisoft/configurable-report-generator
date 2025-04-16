# Image Upload Documentation

This document provides detailed information about the image upload functionality for the Configurable Report Generator application.

## Overview

The image upload system allows users to upload images for OCR processing. It supports drag-and-drop functionality, file validation, upload progress tracking, and image previews.

## Components

### DragDropZone

The `DragDropZone` component provides a drag-and-drop interface for file uploads. It handles:

- Drag-and-drop events
- File selection via button click
- File validation for supported formats and size
- Multiple file selection

#### Props

| Prop | Type | Description |
|------|------|-------------|
| onFilesSelected | (files: FileWithPreview[]) => void | Callback function called when files are selected |
| maxFiles | number | Maximum number of files that can be selected (default: 10) |
| className | string | Additional CSS classes to apply to the component |

### FilePreview

The `FilePreview` component displays previews of selected files. It handles:

- Image thumbnails
- PDF file icons
- File information display (name, size)
- File removal
- Expanded view on click

#### Props

| Prop | Type | Description |
|------|------|-------------|
| files | FileWithPreview[] | Array of files to display |
| onRemove | (fileId: string) => void | Callback function called when a file is removed |

### ProgressBar

The `ProgressBar` component displays the upload progress for a file. It handles:

- Progress percentage display
- File name display
- Upload cancellation

#### Props

| Prop | Type | Description |
|------|------|-------------|
| progress | number | Upload progress percentage (0-100) |
| fileName | string | Name of the file being uploaded |
| onCancel | () => void | Optional callback function for cancelling the upload |

### UploadContainer

The `UploadContainer` component combines all the above components to provide a complete upload experience. It handles:

- File selection
- Upload progress tracking
- Upload results display
- Integration with Supabase Storage

#### Props

| Prop | Type | Description |
|------|------|-------------|
| reportId | string | ID of the report to associate the uploads with |
| onUploadComplete | (results: UploadResult[]) => void | Callback function called when all uploads are complete |

## File Upload Process

1. User selects files via drag-and-drop or file browser
2. Files are validated for supported formats (JPG, PNG, PDF) and size (max 10MB)
3. Valid files are displayed in the preview area
4. User clicks "Upload Files" button
5. Files are uploaded to Supabase Storage with progress tracking
6. Database records are created for each uploaded file
7. Upload results are displayed to the user

## Supported File Types

- JPEG/JPG images
- PNG images
- PDF documents

## File Size Limits

- Maximum file size: 10MB per file

## Integration with Supabase

The upload system integrates with Supabase in the following ways:

1. **Supabase Storage**: Files are uploaded to the appropriate bucket based on file type:
   - Images are stored in the "images" bucket
   - PDFs are stored in the "pdfs" bucket

2. **Database Records**: For each uploaded file, a record is created in the "images" table with the following information:
   - File name
   - Storage path
   - MIME type
   - File size
   - Image dimensions (for image files)
   - Owner ID
   - Report ID

## Usage Example

```tsx
import { UploadContainer } from '@/components/upload/upload-container';
import { UploadResult } from '@/lib/upload';

function MyComponent() {
  const reportId = '123e4567-e89b-12d3-a456-426614174000';
  
  const handleUploadComplete = (results: UploadResult[]) => {
    console.log('Upload complete:', results);
  };
  
  return (
    <UploadContainer
      reportId={reportId}
      onUploadComplete={handleUploadComplete}
    />
  );
}
```

## Error Handling

The upload system handles the following error scenarios:

1. **Invalid File Types**: Files with unsupported formats are rejected with an appropriate error message
2. **File Size Exceeded**: Files larger than the maximum size limit are rejected
3. **Too Many Files**: If the user tries to upload more than the maximum number of files, excess files are ignored
4. **Upload Failures**: If a file fails to upload, an error message is displayed with details

## Future Enhancements

Potential future enhancements to the upload system:

1. **Upload Cancellation**: Allow users to cancel individual file uploads
2. **Retry Failed Uploads**: Add ability to retry failed uploads
3. **Batch Processing**: Add ability to process multiple files in a single operation
4. **Upload Queue**: Implement a queue system for large numbers of files
5. **Image Optimization**: Add client-side image optimization before upload
