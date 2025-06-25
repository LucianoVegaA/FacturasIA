'use client';

import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const RedirectPage = () => {
  const router = useRouter();
  const { instance, accounts, inProgress } = useMsal();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log("🔍 Iniciando procesamiento de redirect...");
        console.log("URL actual:", window.location.href);
        console.log("URL hash:", window.location.hash);
        console.log("URL search:", window.location.search);
        console.log("Cuentas actuales:", accounts);
        console.log("Estado inProgress:", inProgress);
        
        // Debug info para mostrar en pantalla
        setDebugInfo({
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          accounts: accounts.length,
          inProgress
        });
        
        // IMPORTANTE: Manejar la respuesta de redirect
        console.log("📥 Llamando a handleRedirectPromise...");
        const response = await instance.handleRedirectPromise();
        
        console.log("📋 Respuesta de handleRedirectPromise:", response);
        
        if (response) {
          console.log("✅ Login exitoso via redirect:", response);
          console.log("👤 Cuenta:", response.account);
          console.log("🎫 Token:", response.accessToken ? "Token recibido" : "No token");
          
          // Usuario autenticado exitosamente
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000); // Delay para ver el debug
          
        } else if (accounts.length > 0) {
          console.log("✅ Usuario ya autenticado:", accounts[0]);
          
          // Usuario ya estaba autenticado
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          
        } else {
          console.log("❌ No hay respuesta de redirect ni cuentas");
          
          // No hay autenticación, volver al login
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error("💥 Error procesando redirect:", error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        
        // En caso de error, redirigir al login después de unos segundos
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } finally {
        setProcessing(false);
      }
    };

    // Solo procesar si MSAL no está ocupado
    if (inProgress === 'none') {
      handleRedirect();
    } else {
      console.log("⏳ MSAL está ocupado, esperando...", inProgress);
    }
  }, [instance, accounts, inProgress, router]);

  // Pantalla de loading con información de debug
  if (processing || inProgress !== 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground mb-6">
          {inProgress === 'login' && "Procesando autenticación..."}
          {inProgress === 'acquireToken' && "Obteniendo tokens..."}
          {inProgress === 'none' && "Finalizando inicio de sesión..."}
        </p>
        
        {/* Debug info */}
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-lg text-sm max-w-2xl w-full">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div className="space-y-1">
              <p><strong>InProgress:</strong> {debugInfo.inProgress}</p>
              <p><strong>Cuentas:</strong> {debugInfo.accounts}</p>
              <p><strong>URL Hash:</strong> {debugInfo.hash ? "Sí" : "No"}</p>
              <p><strong>URL Search:</strong> {debugInfo.search ? "Sí" : "No"}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error de autenticación</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">Redirigiendo al login en 5 segundos...</p>
          
          {/* Debug info en error */}
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded-lg text-sm text-left">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Completando autenticación...</p>
    </div>
  );
};

export default RedirectPage;