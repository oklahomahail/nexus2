// AsyncBoundary - Combines Suspense + ErrorBoundary for async data loading
import { Suspense, type ReactNode } from 'react';

import { ComponentErrorBoundary } from './ErrorBoundary';

interface AsyncBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
  errorFallback?: ReactNode;
}

export function AsyncBoundary({
  fallback = (
    <div className="flex items-center justify-center p-8">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  errorFallback,
  children,
}: AsyncBoundaryProps) {
  return (
    <ComponentErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ComponentErrorBoundary>
  );
}

export default AsyncBoundary;
