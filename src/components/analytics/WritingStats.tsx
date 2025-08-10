// src/components/Writing/WritingStats.tsx
import React from 'react';

interface WritingStatsProps {
  content: string;
  title: string;
}

const WritingStats: React.FC<WritingStatsProps> = ({ content, title }) => {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="text-xs text-gray-500 text-gray-500 mt-2">
      <p>
        <strong>{title || 'Untitled'}</strong>: {words} words • {chars} characters
      </p>
    </div>
  );
};

export default WritingStats;
