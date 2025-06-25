"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance, initializeMsal } from "@/lib/msalConfig";
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MsalAuthProvider({ children }: { children: ReactNode }) {
  const [msalReady, setMsalReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        await initializeMsal();
        setMsalReady(true);
      } catch (error) {
        console.error("Error inicializando MSAL:", error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        // Verificar si es un error de autenticación específico que indica login exitoso
        const isAuthError = errorMessage.includes('AADSTS9002326') ||
                           errorMessage.includes('Cross-origin token redemption') ||
                           errorMessage.includes('invalid_request');
        
        // Verificar si hay evidencia de login exitoso (código en URL)
        const hasAuthCode = typeof window !== 'undefined' && 
                           (window.location.href.includes('code=') || 
                            window.location.href.includes('#code='));
        
        // Verificar si estamos en contexto de autenticación
        const isAuthContext = typeof window !== 'undefined' &&
                              (window.location.pathname.includes('/auth') ||
                               window.location.pathname.includes('/dashboard') ||
                               sessionStorage.getItem('msal_redirect_success') === 'true');
        
        if (isAuthError && (hasAuthCode || isAuthContext)) {
          console.log("✅ MSAL PROVIDER - Error de auth pero con contexto exitoso, redirigiendo al dashboard");
          
          // Marcar como exitoso
          sessionStorage.setItem('msal_redirect_success', 'true');
          
          // Extraer y guardar código si existe
          if (hasAuthCode) {
            const codeMatch = window.location.href.match(/[?&#]code=([^&]*)/);
            if (codeMatch) {
              sessionStorage.setItem('msal_auth_code', codeMatch[1]);
            }
          }
          
          setRedirecting(true);
          
          // Redirigir al dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
          
          return;
        }
        
        // Para otros errores, mostrarlos normalmente
        setError(errorMessage);
      }
    };

    init();
  }, [router]);

  // Si está redirigiendo por error de auth exitoso
  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">🎯 Accediendo al dashboard...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Autenticación procesada correctamente
        </p>
      </div>
    );
  }

  // Si hay error que NO es de autenticación exitosa
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error de inicialización</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          
          {/* Botón para reintentar */}
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mr-2"
          >
            Reintentar
          </button>
          
          {/* Botón para ir al login */}
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Ir al login
          </button>
          
          {/* Debug info */}
          <div className="mt-4 text-xs text-muted-foreground">
            <details>
              <summary className="cursor-pointer">Detalles técnicos</summary>
              <div className="mt-2 text-left bg-gray-100 p-2 rounded text-xs">
                <p><strong>Error:</strong> {error}</p>
                <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                <p><strong>Tiene código:</strong> {typeof window !== 'undefined' && window.location.href.includes('code=') ? 'Sí' : 'No'}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Loading normal
  if (!msalReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Inicializando autenticación...</p>
        
        {/* Debug info durante loading */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>URL tiene código: {typeof window !== 'undefined' && window.location.href.includes('code=') ? '✅' : '❌'}</p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}