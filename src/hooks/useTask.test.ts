/**
 * Tests for useTask hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTask } from './useTask';

describe('useTask', () => {
  it('initializes with correct state', () => {
    const { result } = renderHook(() => useTask());

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.progress).toBeUndefined();
    expect(result.current.state.result).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();
  });

  it('runs a task and updates state', async () => {
    const { result } = renderHook(() => useTask());

    act(() => {
      result.current.run(async (signal, controls) => {
        controls.updateProgress(50, 'Working...');
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });
    });

    // Should be running
    expect(result.current.state.isRunning).toBe(true);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.state.isRunning).toBe(false);
    });

    expect(result.current.state.result).toBe('done');
    expect(result.current.state.error).toBeUndefined();
  });

  it('reports progress during execution', async () => {
    const { result } = renderHook(() => useTask());

    act(() => {
      result.current.run(async (signal, controls) => {
        controls.updateProgress(25, 'Step 1');
        await new Promise((resolve) => setTimeout(resolve, 10));
        controls.updateProgress(75, 'Step 2');
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'complete';
      });
    });

    // Wait for completion
    await waitFor(() => {
      expect(result.current.state.isRunning).toBe(false);
    });

    expect(result.current.state.progress).toBe(100);
    expect(result.current.state.status).toBe('Completed');
  });

  it('handles cancellation', async () => {
    const { result } = renderHook(() => useTask());

    const taskPromise = act(async () => {
      return result.current.run(async (signal, controls) => {
        controls.updateProgress(10, 'Starting...');
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (signal.aborted) {
          throw new Error('Cancelled');
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'should not complete';
      });
    });

    // Cancel after a short delay
    await new Promise((resolve) => setTimeout(resolve, 20));
    act(() => {
      result.current.cancel();
    });

    await expect(taskPromise).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.state.isRunning).toBe(false);
    });

    expect(result.current.state.status).toBe('Cancelled');
    expect(result.current.wasCancelled).toBe(true);
  });

  it('handles task errors', async () => {
    const { result } = renderHook(() => useTask());

    await act(async () => {
      try {
        await result.current.run(async () => {
          throw new Error('Task failed');
        });
      } catch {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.state.isRunning).toBe(false);
    });

    expect(result.current.state.error).toBeDefined();
    expect(result.current.state.error?.message).toBe('Task failed');
    expect(result.current.state.status).toBe('Failed');
  });

  it('calls lifecycle callbacks', async () => {
    const onComplete = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useTask({
        onComplete,
        onError,
      })
    );

    // Test success callback
    await act(async () => {
      await result.current.run(async () => 'success');
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();

    // Test error callback
    await act(async () => {
      try {
        await result.current.run(async () => {
          throw new Error('fail');
        });
      } catch {
        // Expected
      }
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'fail' }));
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useTask({ initialStatus: 'Ready' }));

    // Run a task to completion
    act(() => {
      result.current.run(async () => 'done');
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.result).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();
    expect(result.current.state.status).toBe('Ready');
  });

  it('aborts on unmount', () => {
    const { result, unmount } = renderHook(() => useTask());

    const abortSpy = vi.fn();

    act(() => {
      result.current.run(async (signal) => {
        signal.addEventListener('abort', abortSpy);
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
    });

    unmount();

    expect(abortSpy).toHaveBeenCalled();
  });
});
