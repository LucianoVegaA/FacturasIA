'use client';

import { useEffect } from 'react';
import { useMsalAuthentication, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { useRouter } from 'next/navigation';

const RedirectPage = () => {
  const router = useRouter();
  const { instance, accounts, inProgress } = useMsal();

  useEffect(() => {
    if (accounts.length > 0 && inProgress === 'none') {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [accounts, inProgress, router]);

  // Handle the redirect promise. MSAL React's useMsalAuthentication handles this internally.
  // We just need to ensure the component renders to trigger the hooks.

  return (
    <div>
      {inProgress === 'login' && <p>Processing login...</p>}
      {inProgress === 'acquireToken' && <p>Acquiring token...</p>}
      {inProgress === 'none' && accounts.length === 0 && (
        <p>Redirecting after login attempt...</p>
      )}
       {/* The useEffect above handles the redirect once accounts are populated */}
    </div>
  );
};

export default RedirectPage;