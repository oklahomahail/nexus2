// src/components/LoadingSpinner.tsx - Updated for dark theme
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div 
          className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-slate-600 border-t-blue-500`}
        />
        {text && (
          <p className="text-slate-400 text-sm font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
