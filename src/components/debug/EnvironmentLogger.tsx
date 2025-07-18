"use client";

import { useEffect } from 'react';

export function EnvironmentLogger() {
  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window !== 'undefined') {
      console.log('='.repeat(50));
      console.log('[ENV DEBUG] ENVIRONMENT VARIABLES DEBUG');
      console.log('='.repeat(50));
      
      // General environment info
      console.log('[ENV DEBUG] General Environment:');
      console.log('[ENV DEBUG] NODE_ENV:', process.env.NODE_ENV);
      console.log('[ENV DEBUG] NEXT_PUBLIC_NODE_ENV:', process.env.NEXT_PUBLIC_NODE_ENV);
      console.log('[ENV DEBUG] Browser environment:', typeof window !== 'undefined');
      console.log('');
      
      // MongoDB variables
      console.log('[ENV DEBUG] MongoDB Variables:');
      console.log('[ENV DEBUG] MONGODB_URI exists:', !!process.env.MONGODB_URI);
      console.log('[ENV DEBUG] MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
      console.log('[ENV DEBUG] MONGODB_URI first 20 chars:', process.env.MONGODB_URI?.substring(0, 20) + '...' || 'undefined');
      console.log('[ENV DEBUG] MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME || 'undefined');
      console.log('');
      
      // MSAL/Azure variables 
      console.log('[ENV DEBUG] Azure/MSAL Variables:');
      console.log('[ENV DEBUG] NEXT_PUBLIC_AZURE_AD_CLIENT_ID exists:', !!process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID);
      console.log('[ENV DEBUG] NEXT_PUBLIC_AZURE_AD_CLIENT_ID:', process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || 'undefined');
      console.log('[ENV DEBUG] NEXT_PUBLIC_AZURE_AD_TENANT_ID exists:', !!process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID);
      console.log('[ENV DEBUG] NEXT_PUBLIC_AZURE_AD_TENANT_ID:', process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'undefined');
      console.log('');
      
      // All environment variables that contain certain keywords
      console.log('[ENV DEBUG] All MONGO-related variables:');
      Object.keys(process.env)
        .filter(key => key.includes('MONGO'))
        .forEach(key => {
          const value = process.env[key];
          if (key.includes('URI')) {
            console.log(`[ENV DEBUG] ${key}: ${value?.substring(0, 20)}... (length: ${value?.length})`);
          } else {
            console.log(`[ENV DEBUG] ${key}: ${value}`);
          }
        });
      
      console.log('');
      console.log('[ENV DEBUG] All AZURE-related variables:');
      Object.keys(process.env)
        .filter(key => key.includes('AZURE'))
        .forEach(key => {
          console.log(`[ENV DEBUG] ${key}: ${process.env[key]}`);
        });
      
      console.log('');
      console.log('[ENV DEBUG] All NEXT_PUBLIC variables:');
      Object.keys(process.env)
        .filter(key => key.startsWith('NEXT_PUBLIC_'))
        .forEach(key => {
          console.log(`[ENV DEBUG] ${key}: ${process.env[key]}`);
        });
      
      console.log('='.repeat(50));
      console.log('[ENV DEBUG] END ENVIRONMENT VARIABLES DEBUG');
      console.log('='.repeat(50));
    }
  }, []);

  return null; // This component only logs, doesn't render anything
}