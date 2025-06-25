"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from "react";
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
  const [allowAccess, setAllowAccess] = useState(false);

  useEffect(() => {
    if (inProgress === InteractionStatus.None && !demoAuthLoading) {
      const accounts = instance.getAllAccounts();
      
      // Verificar si venimos de una página de redirect exitosa
      const comingFromRedirect = document.referrer.includes('/auth/redirect') || 
                                sessionStorage.getItem('msal_redirect_success') === 'true';
      
      // Permitir acceso si:
      // 1. Está autenticado por MSAL
      // 2. Está autenticado por demo
      // 3. Hay cuentas en MSAL (incluso si msalIsAuthenticated es false)
      // 4. Viene de redirect exitoso (para casos de error AADSTS9002326)
      if (msalIsAuthenticated || isDemoAuthenticated || accounts.length > 0 || comingFromRedirect) {
        console.log("✅ Acceso permitido al dashboard:", {
          msalAuth: msalIsAuthenticated,
          demoAuth: isDemoAuthenticated,
          accounts: accounts.length,
          fromRedirect: comingFromRedirect
        });
        setAllowAccess(true);
      } else {
        console.log("❌ No hay autenticación válida, redirigiendo a login");
        router.push("/");
      }
    }
  }, [msalIsAuthenticated, isDemoAuthenticated, inProgress, demoAuthLoading, router, instance]);

  // Mostrar loading mientras verificamos
  if (demoAuthLoading || inProgress !== InteractionStatus.None || !allowAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {demoAuthLoading && "Cargando configuración..."}
          {inProgress !== InteractionStatus.None && "Verificando sesión..."}
          {!allowAccess && inProgress === InteractionStatus.None && !demoAuthLoading && "Validando acceso..."}
        </p>
      </div>
    );
  }

  // Si llegamos aquí, permitir acceso
  return <>{children}</>;
}