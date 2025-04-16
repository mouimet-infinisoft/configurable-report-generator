/**
 * Options for text enhancement
 */
export interface EnhancementOptions {
  language?: string;
  reportType?: string;
  additionalInstructions?: string;
}

/**
 * Result of text enhancement
 */
export interface EnhancementResult {
  enhancedText: string;
  sections?: {
    title: string;
    content: string;
  }[];
  model?: string;
  error?: string;
}

/**
 * Type for AI enhancement function
 */
export type EnhanceTextFunction = (
  text: string,
  options?: EnhancementOptions
) => Promise<EnhancementResult>;

/**
 * Type for streaming AI enhancement function
 */
export type StreamingEnhanceTextFunction = (
  text: string,
  options?: EnhancementOptions
) => Promise<ReadableStream<EnhancementResult>>;
