'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CLIENT_AI_FEATURE_FLAGS } from '@/lib/ai/feature-flags';

interface AIEnhancementToggleProps {
  onToggleVercelAI: (enabled: boolean) => void;
  onToggleStreaming: (enabled: boolean) => void;
}

/**
 * A component to toggle between direct API and Vercel AI SDK
 * and to enable/disable streaming
 */
export function AIEnhancementToggle({
  onToggleVercelAI,
  onToggleStreaming
}: AIEnhancementToggleProps) {
  const [useVercelAI, setUseVercelAI] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false);
  const [streamingAvailable, setStreamingAvailable] = useState(false);

  // Check if streaming is available and set initial toggle states
  useEffect(() => {
    // Get the feature flags
    const vercelAIEnabled = CLIENT_AI_FEATURE_FLAGS.useVercelAI;
    const streamingEnabled = CLIENT_AI_FEATURE_FLAGS.useStreaming;

    // Streaming is available if Vercel AI SDK is enabled
    setStreamingAvailable(vercelAIEnabled);

    // Set initial toggle states based on feature flags
    setUseVercelAI(vercelAIEnabled);
    setUseStreaming(streamingEnabled);

    // Notify parent components of initial state
    onToggleVercelAI(vercelAIEnabled);
    onToggleStreaming(streamingEnabled);
  }, [onToggleVercelAI, onToggleStreaming]);

  // Handle Vercel AI toggle
  const handleVercelAIToggle = (checked: boolean) => {
    setUseVercelAI(checked);
    onToggleVercelAI(checked);

    // If Vercel AI is disabled, also disable streaming
    if (!checked && useStreaming) {
      setUseStreaming(false);
      onToggleStreaming(false);
    }
  };

  // Handle streaming toggle
  const handleStreamingToggle = (checked: boolean) => {
    setUseStreaming(checked);
    onToggleStreaming(checked);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
      <h3 className="text-lg font-medium">AI Enhancement Options</h3>

      <div className="flex items-center space-x-2">
        <Switch
          id="use-vercel-ai"
          checked={useVercelAI}
          onCheckedChange={handleVercelAIToggle}
        />
        <Label htmlFor="use-vercel-ai">Use Vercel AI SDK</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="use-streaming"
          checked={useStreaming}
          onCheckedChange={handleStreamingToggle}
          disabled={!useVercelAI || !streamingAvailable}
        />
        <Label htmlFor="use-streaming">
          Enable Streaming
          {!streamingAvailable && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              (Requires server configuration)
            </span>
          )}
        </Label>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {useVercelAI ? (
          <p>Using Vercel AI SDK with {useStreaming ? 'streaming enabled' : 'streaming disabled'}</p>
        ) : (
          <p>Using direct API calls (original implementation)</p>
        )}
      </div>
    </div>
  );
}
