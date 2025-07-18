"use client";

import { useState, useCallback } from 'react';

export function useServerAction<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  options?: {
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
    retries?: number;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<R | null>(null);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setIsLoading(true);
    setError(null);
    
    let lastError: Error | null = null;
    const maxRetries = options?.retries ?? 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await action(...args);
        setData(result);
        setIsLoading(false);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        
        // Final attempt failed
        console.error(`Server action failed after ${maxRetries + 1} attempts:`, lastError);
        setError(lastError);
        setIsLoading(false);
        options?.onError?.(lastError);
        return null;
      }
    }
    
    return null;
  }, [action, options]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset
  };
}