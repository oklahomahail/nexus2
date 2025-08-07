import React, { useState } from 'react';
import { generateClaudeResponse } from '../features/claude/claudeService';

type MessageType = 'Email' | 'Subject Line' | 'Social Post' | 'CTA Button';

export default function MessagingAssistantPanel() {
  const [messageType, setMessageType] = useState<MessageType>('Email');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const promptTemplate = {
    Email: `Write a fundraising email for the following campaign:\n\n`,
    'Subject Line': `Write 3 subject lines for a fundraising email based on this campaign:\n\n`,
    'Social Post': `Write a short social media post to support this fundraising campaign:\n\n`,
    'CTA Button': `Write 3 short CTA button texts for this fundraising ask:\n\n`,
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      const prompt = `${promptTemplate[messageType]}${context}`;
      const response = await generateClaudeResponse(prompt);
      setResult(response.content);
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 mt-10 rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-semibold">AI Messaging Assistant</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Select message type</label>
        <select
          value={messageType}
          onChange={e => setMessageType(e.target.value as MessageType)}
          className="w-full border rounded p-2 text-sm"
        >
          <option>Email</option>
          <option>Subject Line</option>
          <option>Social Post</option>
          <option>CTA Button</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Campaign context</label>
        <textarea
          rows={5}
          value={context}
          onChange={e => setContext(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          placeholder="Describe the campaign, audience, and key goals..."
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !context}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Message'}
      </button>

      {result && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-medium mb-2">AI-Generated Output:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
