"use client";

import type { ReactNode } from 'react';
import { useEffect } from "react";
import { useIsAuthenticated as useMsalIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react';
import { useDemoAuth } from '@/context/DemoAuthProvider';

export function DashboardGuard({ children }: { children: ReactNode }) {
  const { inProgress, instance } = useMsal();
  const msalIsAuthenticated = useMsalIsAuthenticated();
  const { isDemoAuthenticated, loading: demoAuthLoading } = useDemoAuth();
  const router = useRouter();

  useEffect(() => {
    if (inProgress === InteractionStatus.None && !demoAuthLoading) {
      // Verificar si hay cuentas disponibles (incluso si useMsalIsAuthenticated es false)
      const accounts = instance.getAllAccounts();
      
      if (!msalIsAuthenticated && !isDemoAuthenticated && accounts.length === 0) {
        console.log("No hay autenticación válida, redirigiendo a login");
        router.push("/");
      } else if (accounts.length > 0) {
        console.log("Cuenta encontrada, permitiendo acceso al dashboard");
        // Permitir acceso si hay cuentas, incluso si msalIsAuthenticated es false
      }
    }
  }, [msalIsAuthenticated, isDemoAuthenticated, inProgress, demoAuthLoading, router, instance]);

  if (demoAuthLoading || (inProgress !== InteractionStatus.None)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  // Permitir acceso si está autenticado por cualquier método O si hay cuentas MSAL
  const accounts = instance.getAllAccounts();
  if (msalIsAuthenticated || isDemoAuthenticated || accounts.length > 0) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Redirigiendo...</p>
    </div>
  );
}