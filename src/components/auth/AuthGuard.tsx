
"use client";

import type { ReactNode } from 'react';
import { useEffect } from "react";
import { useIsAuthenticated, useMsal, MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionStatus, InteractionType, AuthenticationResult, AuthError } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/msalConfig";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Import Button for error component

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      if (accounts.length > 0) {
        instance.ssoSilent(loginRequest)
          .then((response: AuthenticationResult) => {
            instance.setActiveAccount(response.account);
          })
          .catch((err: AuthError) => {
            console.warn("ssoSilent failed, attempting popup:", err);
            // Fallback to interactive login if ssoSilent fails
            instance.loginPopup(loginRequest).catch(e => console.error("Login popup failed: ", e));
          });
      } else {
        // No accounts, new login attempt with popup
        instance.loginPopup(loginRequest).catch(e => console.error("Login popup failed: ", e));
      }
    }
  }, [isAuthenticated, inProgress, instance, router, accounts]);


  const authRequest = {
    ...loginRequest
  };

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Popup} // Changed to Popup
      authenticationRequest={authRequest}
      loadingComponent={() => (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Authenticating your session...</p>
        </div>
      )}
      errorComponent={({error}) => (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-2">Sorry, we couldn't sign you in.</p>
          <p className="text-xs text-muted-foreground mb-4">Details: {error?.message || "Unknown error"}</p>
          <Button onClick={() => instance.loginPopup(loginRequest)}>Try Again</Button>
        </div>
      )}
    >
      {children}
    </MsalAuthenticationTemplate>
  );
}
