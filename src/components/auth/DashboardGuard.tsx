
"use client";

import type { ReactNode } from 'react';
import { useEffect } from "react";
import { useIsAuthenticated as useMsalIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react';
import { useDemoAuth } from '@/context/DemoAuthProvider';

export function DashboardGuard({ children }: { children: ReactNode }) {
  console.log('DashboardGuard rendering');
  const { inProgress } = useMsal();
  const msalIsAuthenticated = useMsalIsAuthenticated();
  const { isDemoAuthenticated, loading: demoAuthLoading } = useDemoAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for both MSAL to be idle and demo auth to have loaded from storage
    console.log('DashboardGuard useEffect', { msalIsAuthenticated, isDemoAuthenticated, inProgress, demoAuthLoading });
    if (inProgress === InteractionStatus.None && !demoAuthLoading) {
      if (!msalIsAuthenticated && !isDemoAuthenticated) {
        router.push("/"); // Redirect to login if not authenticated by either
      }
    }
  }, [msalIsAuthenticated, isDemoAuthenticated, inProgress, demoAuthLoading, router]);

  // Show loading indicator if:
  // 1. Demo auth is still loading from storage OR
  // 2. MSAL is processing and neither MSAL nor Demo user is authenticated yet.
  if (demoAuthLoading || (inProgress !== InteractionStatus.None && !msalIsAuthenticated && !isDemoAuthenticated)) {
    console.log('DashboardGuard: Showing loading indicator');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  // If authenticated by either method, render the children
  if (msalIsAuthenticated || isDemoAuthenticated) {
    console.log('DashboardGuard: Authenticated, rendering children');
    return <>{children}</>;
  }

  // If not yet authenticated and not loading, it means redirect is imminent or has occurred.
  // Show a loader to prevent flash of unstyled content if redirect is slow.
  console.log('DashboardGuard: Not authenticated and not loading, showing redirecting indicator');
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Redirigiendo...</p>
      </div>
  );
}
