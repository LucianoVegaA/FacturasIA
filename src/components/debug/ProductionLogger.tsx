"use client";

import { useEffect } from 'react';

interface ProductionLoggerProps {
  component: string;
  data?: any;
  error?: Error | null;
}

export function ProductionLogger({ component, data, error }: ProductionLoggerProps) {
  useEffect(() => {
    // Only log in client-side and in production
    if (typeof window !== 'undefined') {
      if (error) {
        console.error(`[${component}] Error:`, error);
        console.error(`[${component}] Error stack:`, error.stack);
      } else if (data) {
        console.log(`[${component}] Data:`, data);
      } else {
        console.log(`[${component}] Component loaded`);
      }
    }
  }, [component, data, error]);

  return null; // This component doesn't render anything
}

// Hook for easier logging
export function useProductionLogger(component: string) {
  const log = (message: string, data?: any) => {
    if (typeof window !== 'undefined') {
      console.log(`[${component}] ${message}`, data);
    }
  };

  const error = (message: string, error?: Error) => {
    if (typeof window !== 'undefined') {
      console.error(`[${component}] ${message}`, error);
    }
  };

  return { log, error };
}