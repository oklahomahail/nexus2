// utils/safeCall.ts
export function safeCall<T extends (...args: any[]) => unknown>(
  fn?: T,
  onError: (e: unknown) => void = (e) => {
    if (process.env.NODE_ENV !== "production") console.error(e);
  },
) {
  return (...args: Parameters<T>): void => {
    if (!fn) return;
    try {
      const r = fn(...args);
      // If it quacks like a promise, catch it
      if (r && typeof (r as any).then === "function") {
        void (r as Promise<unknown>).catch(onError);
      }
    } catch (e) {
      onError(e);
    }
  };
}
