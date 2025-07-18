
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from "react";
import { useIsAuthenticated as useMsalIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react';
import { useDemoAuth } from '@/context/DemoAuthProvider';

export function DashboardGuard({ children }: { children: ReactNode }) {
  const { inProgress } = useMsal();
  const msalIsAuthenticated = useMsalIsAuthenticated();
  const { isDemoAuthenticated, loading: demoAuthLoading } = useDemoAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check auth once MSAL is idle and demo auth is loaded
    if (inProgress === InteractionStatus.None && !demoAuthLoading && !isRedirecting) {
      if (!msalIsAuthenticated && !isDemoAuthenticated) {
        console.log("Dashboard: Not authenticated, redirecting to login");
        setIsRedirecting(true);
        router.push("/");
      }
    }
  }, [msalIsAuthenticated, isDemoAuthenticated, inProgress, demoAuthLoading, router, isRedirecting]);

  // Show loading indicator if:
  // 1. Demo auth is still loading from storage OR
  // 2. MSAL is processing
  // 3. We are in the process of redirecting
  if (demoAuthLoading || inProgress !== InteractionStatus.None || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  // If authenticated by either method, render the children
  if (msalIsAuthenticated || isDemoAuthenticated) {
    return <>{children}</>;
  }

  // If we reach here and not authenticated, show loading while redirect happens
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Redirigiendo al login...</p>
    </div>
  );
}
