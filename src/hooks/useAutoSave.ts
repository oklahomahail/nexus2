import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  key: string;
  data: string;
  onSave: (data: string) => Promise<void>;
  delay?: number; // milliseconds to wait before saving
}

export default function useAutoSave({ 
  key, 
  data, 
  onSave, 
  delay = 1000 
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>(data);

  useEffect(() => {
    // Don't save if data hasn't changed
    if (data === previousDataRef.current) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Save to localStorage immediately for local persistence
    try {
      localStorage.setItem(key, data);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }

    // Debounce the onSave callback (for backup/API calls)
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        previousDataRef.current = data;
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, onSave, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}