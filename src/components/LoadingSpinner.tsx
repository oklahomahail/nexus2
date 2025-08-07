import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`animate-spin rounded-full border-4 border-t-transparent border-gray-400 ${sizeMap[size]}`} />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
