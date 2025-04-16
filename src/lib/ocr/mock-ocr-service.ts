import { OCRResult, OCROptions } from './types';

/**
 * Mock OCR service for testing without API keys
 */
export function mockOCR(imageUrl: string, options: OCROptions = {}): OCRResult {
  const { language = 'eng', onProgress } = options;
  
  // Update progress
  if (onProgress) {
    onProgress({ status: 'initializing', progress: 0.1 });
  }
  
  // Simulate processing delay
  if (onProgress) {
    onProgress({ status: 'processing', progress: 0.5 });
  }
  
  // Generate mock text based on the image URL
  const mockText = generateMockText(imageUrl, language);
  
  // Final progress update
  if (onProgress) {
    onProgress({ status: 'completed', progress: 1.0 });
  }
  
  return {
    text: mockText,
    confidence: 0.85,
    paragraphs: mockText.split('\n\n'),
    language,
    processedWithAI: true,
  };
}

/**
 * Generate mock text based on the image URL and language
 */
function generateMockText(imageUrl: string, language: string): string {
  // Use a hash of the URL to generate consistent text for the same image
  const hash = hashString(imageUrl);
  
  if (language === 'fra' || language === 'eng+fra') {
    return `Exemple de texte en français extrait de l'image.
    
Ceci est un paragraphe généré automatiquement pour simuler l'OCR.
    
Le texte contient plusieurs paragraphes pour tester le formatage.
    
Image ID: ${hash}`;
  } else {
    return `Sample text extracted from the image.
    
This is an automatically generated paragraph to simulate OCR.
    
The text contains multiple paragraphs to test formatting.
    
Image ID: ${hash}`;
  }
}

/**
 * Simple hash function for strings
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}
