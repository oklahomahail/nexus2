// src/services/ai/ClaudeToolbar.tsx
import React, { useState } from 'react';
import { useClaude } from '@/context/ClaudeProvider';

interface ClaudeToolbarProps {
  selectedText?: string;
  onInsertText?: (text: string) => void;
}

const ClaudeToolbar: React.FC<ClaudeToolbarProps> = ({ selectedText = '', onInsertText }) => {
  const { generateResponse, isLoading } = useClaude();

  const [lastResult, setLastResult] = useState<string>('');

  const handleSuggestContinuation = async (): Promise<void> => {
    const target = selectedText || '';
    if (!target || isLoading) return;

    try {
      const result = await generateResponse({
        prompt: `Continue this text in the same style and tone: "${target}"`,
        context: { action: 'continuation' }
      });
      
      if (result.success) {
        setLastResult(result.content);
        console.log(`Claude continuation for: "${target.slice(0, 50)}..."`);
        console.log(result.content);
      }
    } catch (error) {
      console.error('Failed to suggest continuation:', error);
    }
  };

  const handleImproveText = async (): Promise<void> => {
    const target = selectedText || '';
    if (!target || isLoading) return;

    try {
      const result = await generateResponse({
        prompt: `Improve this text for clarity, flow, and impact: "${target}"`,
        context: { action: 'improvement' }
      });
      
      if (result.success) {
        setLastResult(result.content);
        console.log(`Claude improved: "${target.slice(0, 50)}..."`);
        console.log(result.content);
      }
    } catch (error) {
      console.error('Failed to improve text:', error);
    }
  };

  const handleGeneratePlotIdeas = async (): Promise<void> => {
    if (isLoading) return;

    try {
      const context = selectedText ? `Based on this context: "${selectedText}"` : '';
      const result = await generateResponse({
        prompt: `Generate creative plot ideas for a story. ${context}`,
        context: { action: 'plot_generation' }
      });
      
      if (result.success) {
        setLastResult(result.content);
        console.log('Claude plot ideas:');
        console.log(result.content);
      }
    } catch (error) {
      console.error('Failed to generate plot ideas:', error);
    }
  };

  const handleInsert = (): void => {
    if (onInsertText && lastResult) {
      onInsertText(lastResult);
      setLastResult(''); // Clear after inserting
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded shadow-sm">
      <button
        onClick={handleSuggestContinuation}
        disabled={!selectedText || isLoading}
        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '...' : 'Continue'}
      </button>
      <button
        onClick={handleImproveText}
        disabled={!selectedText || isLoading}
        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '...' : 'Improve'}
      </button>
      <button
        onClick={handleGeneratePlotIdeas}
        disabled={isLoading}
        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '...' : 'Plot Ideas'}
      </button>
      {lastResult && onInsertText && (
        <button
          onClick={handleInsert}
          className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-500 transition"
        >
          Insert Result
        </button>
      )}
      {lastResult && (
        <div className="w-full mt-2 p-2 text-xs bg-gray-200 dark:bg-gray-700 rounded">
          <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            Claude&apos;s suggestion:
          </div>
          <div className="text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto">
            {lastResult}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaudeToolbar;