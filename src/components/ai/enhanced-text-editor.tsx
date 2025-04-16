'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { enhanceText, isStreamingEnhancementAvailable } from '@/lib/ai/text-enhancement';
import { AIEnhancementToggle } from '@/components/ai/ai-enhancement-toggle';
import { toast } from 'sonner';

interface EnhancedTextEditorProps {
  initialText: string;
  language?: string;
  reportType?: string;
  onSave: (text: string) => void;
  onEnhance: (text: string) => void;
  isProcessing?: boolean;
}

export function EnhancedTextEditor({
  initialText,
  language = 'french',
  reportType = 'evaluation',
  onSave,
  onEnhance,
  isProcessing = false
}: EnhancedTextEditorProps) {
  const [text, setText] = useState(initialText);
  const [useVercelAI, setUseVercelAI] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false);
  const [isLocalEnhancing, setIsLocalEnhancing] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSave = () => {
    onSave(text);
    toast.success('Text saved', {
      description: 'The text has been saved successfully.',
    });
  };

  const handleEnhance = async () => {
    try {
      // If using Vercel AI SDK, enhance directly here
      if (useVercelAI) {
        setIsLocalEnhancing(true);

        try {
          const result = await enhanceText(text, {
            language,
            reportType,
            useStreaming: useStreaming && isStreamingEnhancementAvailable()
          });

          setText(result.enhancedText);

          // Call both onSave and onEnhance to ensure the parent component is updated
          onSave(result.enhancedText);
          onEnhance(result.enhancedText);

          toast.success('Text enhanced', {
            description: `Enhanced with ${result.model || 'AI'}.`,
          });
        } catch (error) {
          console.error('Error enhancing text with Vercel AI SDK:', error);
          toast.error('Error enhancing text', {
            description: 'There was an error enhancing the text with AI.',
          });
        } finally {
          setIsLocalEnhancing(false);
        }
      } else {
        // Otherwise use the parent's enhance handler
        onEnhance(text);
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error('Error enhancing text', {
        description: 'There was an error enhancing the text with AI.',
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Extracted Text</h2>

      <div className="space-y-4">
        <Textarea
          value={text}
          onChange={handleTextChange}
          className="min-h-[300px] font-mono"
          placeholder="OCR text will appear here"
          disabled={isProcessing || isLocalEnhancing}
        />

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button
            onClick={handleSave}
            disabled={isProcessing || isLocalEnhancing || !text.trim()}
            variant="outline"
          >
            Save Text
          </Button>

          <Button
            onClick={handleEnhance}
            disabled={isProcessing || isLocalEnhancing || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing || isLocalEnhancing ? 'Enhancing...' : 'Enhance with AI'}
          </Button>
        </div>

        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-medium mb-2">AI Enhancement Options</h3>
          <AIEnhancementToggle
            onToggleVercelAI={setUseVercelAI}
            onToggleStreaming={setUseStreaming}
          />

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {useVercelAI ? (
              <p>Using Vercel AI SDK for text enhancement. {useStreaming && isStreamingEnhancementAvailable() ? 'Streaming is enabled.' : ''}</p>
            ) : (
              <p>Using standard API for text enhancement.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
