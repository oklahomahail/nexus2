// src/services/storageService.ts

export const storageService = {
  getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (err) {
      console.error(`Error reading from localStorage key "${key}":`, err);
      return null;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing to localStorage key "${key}":`, err);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (err) {
      console.error("Error clearing localStorage:", err);
    }
  },
};
