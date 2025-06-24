"use client";

import type { ReactNode } from 'react';
import { MsalProvider, useMsal } from "@azure/msal-react";
import { msalInstance } from "@/lib/msalConfig";
import type { AuthenticationResult } from '@azure/msal-browser';
import { useEffect } from 'react';

/**
 * A component that handles the MSAL redirect promise.
 * This should be used inside the MsalProvider.
 * It ensures that the response from a redirect login is processed.
 */
function MsalRedirectHandler({ children }: { children: ReactNode }) {
  const { instance } = useMsal();

  useEffect(() => {
    instance
      .handleRedirectPromise()
      .then((response: AuthenticationResult | null) => {
        if (response && response.account) {
          instance.setActiveAccount(response.account);
        }
      })
      .catch((e) => {
        // Handle redirect errors here
        console.error("MSAL redirect promise error:", e);
      });
  }, [instance]);

  return <>{children}</>;
}


export function MsalAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <MsalRedirectHandler>
        {children}
      </MsalRedirectHandler>
    </MsalProvider>
  );
}
