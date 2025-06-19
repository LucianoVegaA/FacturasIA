"use client";

import type { ReactNode } from 'react';
import { useEffect } from "react";
import { useIsAuthenticated, useMsal, MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionStatus, InteractionType, AuthenticationResult } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/msalConfig";
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    // This effect ensures that if a user lands on a protected route without an active session
    // (e.g. deep link, bookmark, or after session expiry) and MSAL is not already processing,
    // it initiates a login.
    // It also handles redirecting to dashboard if already authenticated.
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      // Check if there are accounts, meaning user was previously logged in. Try ssoSilent first.
      if (accounts.length > 0) {
        instance.ssoSilent(loginRequest)
          .then((response: AuthenticationResult) => {
            instance.setActiveAccount(response.account);
            // router.push('/dashboard'); // Let MsalAuthenticationTemplate handle rendering children
          })
          .catch(err => {
            console.warn("ssoSilent failed, attempting redirect:", err);
            instance.loginRedirect(loginRequest).catch(e => console.error("Login redirect failed: ", e));
          });
      } else {
        // No accounts, new login attempt
        instance.loginRedirect(loginRequest).catch(e => console.error("Login redirect failed: ", e));
      }
    }
  }, [isAuthenticated, inProgress, instance, router, accounts]);


  const authRequest = {
    ...loginRequest
  };

  // MsalAuthenticationTemplate handles rendering children when authenticated
  // or showing a loading/error state.
  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
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
          <Button onClick={() => instance.loginRedirect(loginRequest)}>Try Again</Button>
        </div>
      )}
    >
      {children}
    </MsalAuthenticationTemplate>
  );
}
