'use client';

import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const RedirectPage = () => {
  const router = useRouter();
  const { instance, accounts, inProgress } = useMsal();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Process the redirect response from Azure AD
        await instance.handleRedirectPromise();

        // Regardless of the response, redirect to the dashboard
        router.push('/dashboard');

      } catch (error) {
        // If there's an error, still attempt to redirect to dashboard
        // The DashboardGuard component will handle unauthenticated users
        router.push('/dashboard');
      }
    };

    // Solo procesar si MSAL no está ocupado
    if (inProgress === 'none') {
      handleRedirect();
    } else {
      // If MSAL is busy, wait for it to finish before attempting redirect
      // The component will render the loading state until inProgress is 'none'
    }
  }, [instance, accounts, inProgress, router]);

  // Simple loading state while MSAL processes or we wait for redirect
  // The redirect will happen in the useEffect hook
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Completando autenticación...</p>
    </div>
  );
};

export default RedirectPage;