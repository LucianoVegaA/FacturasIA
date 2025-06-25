"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance, initializeMsal } from "@/lib/msalConfig";
import { Loader2 } from 'lucide-react';

export function MsalAuthProvider({ children }: { children: ReactNode }) {
  const [msalReady, setMsalReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeMsal();
        setMsalReady(true);
      } catch (error) {
        console.error("Error inicializando MSAL:", error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error de inicialización</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!msalReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Inicializando autenticación...</p>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}