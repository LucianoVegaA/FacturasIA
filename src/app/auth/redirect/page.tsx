'use client';

import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const RedirectPage = () => {
  const router = useRouter();
  const { instance, accounts, inProgress } = useMsal();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const forceRedirectToDashboard = (reason: string) => {
      console.log(`🎯 FORZANDO REDIRECT AL DASHBOARD: ${reason}`);
      setRedirecting(true);
      
      // Marcar como exitoso
      sessionStorage.setItem('msal_redirect_success', 'true');
      
      // Limpiar la URL para evitar loops
      window.history.replaceState({}, '', '/auth/redirect');
      
      // Redirigir inmediatamente
      router.push('/dashboard');
    };

    // 🔥 FUNCIÓN UNIVERSAL DE MANEJO DE ERRORES
    const handleAnyError = (error: any, source: string) => {
      console.log(`🚨 ERROR DETECTADO EN ${source}:`, error?.message || error);
      
      // Si hay código en URL, siempre redirigir al dashboard
      const hasCode = window.location.href.includes('code=') || window.location.href.includes('#code=');
      
      if (hasCode) {
        console.log("✅ HAY CÓDIGO EN URL - REDIRIGIENDO AL DASHBOARD");
        forceRedirectToDashboard(`Error en ${source} pero hay código`);
        return true; // Indica que se manejó el error
      }

      // Para errores específicos de MSAL, también redirigir
      const msalErrors = [
        'AADSTS9002326',
        'Cross-origin token redemption',
        'invalid_request',
        'interaction_required',
        'login_required'
      ];

      const isMsalError = msalErrors.some(errorType => 
        error?.message?.includes(errorType) || String(error).includes(errorType)
      );

      if (isMsalError) {
        console.log("✅ ERROR DE MSAL DETECTADO - REDIRIGIENDO AL DASHBOARD");
        forceRedirectToDashboard(`Error MSAL en ${source}: ${error?.message || error}`);
        return true;
      }

      // 🚨 OPCIÓN NUCLEAR: REDIRIGIR EN CUALQUIER ERROR
      // Descomenta la siguiente línea si quieres que CUALQUIER error redirija al dashboard
      // forceRedirectToDashboard(`Error genérico en ${source}: ${error?.message || error}`);
      // return true;

      return false; // No se manejó el error
    };

    const handleRedirect = async () => {
      try {
        console.log("🔍 Iniciando proceso de redirect...");
        console.log("URL completa:", window.location.href);
        
        // 1. Verificar código en URL PRIMERO
        const fullUrl = window.location.href;
        const hasCode = fullUrl.includes('code=') || fullUrl.includes('#code=');
        
        if (hasCode) {
          console.log("✅ CÓDIGO DETECTADO EN URL - REDIRECT INMEDIATO");
          forceRedirectToDashboard("Código encontrado en URL");
          return;
        }

        // 2. Si hay cuentas, redirigir
        if (accounts.length > 0) {
          console.log("✅ CUENTAS EXISTENTES - REDIRECT INMEDIATO");
          forceRedirectToDashboard("Cuentas existentes");
          return;
        }

        // 3. Parchar las funciones de MSAL para interceptar errores
        console.log("🔧 Aplicando parches a MSAL...");
        
        // Guardar la función original
        const originalHandleRedirectPromise = instance.handleRedirectPromise.bind(instance);
        
        // Crear función parcheada con manejo universal de errores
        const patchedHandleRedirectPromise = async () => {
          try {
            console.log("📞 Llamando a handleRedirectPromise original...");
            return await originalHandleRedirectPromise();
          } catch (error: any) {
            console.log("🚨 ERROR INTERCEPTADO EN PATCH:", error.message);
            
            // Usar la función universal de manejo de errores
            if (handleAnyError(error, "handleRedirectPromise patch")) {
              return null; // Error manejado, retornar null
            }
            
            // Si no se manejó el error, relanzarlo
            throw error;
          }
        };

        // Aplicar el patch
        (instance as any).handleRedirectPromise = patchedHandleRedirectPromise;

        // 4. Ahora llamar a la función parcheada
        console.log("⚠️ Ejecutando handleRedirectPromise parcheado...");
        const response = await patchedHandleRedirectPromise();
        
        if (response) {
          console.log("✅ HandleRedirectPromise exitoso con patch");
          forceRedirectToDashboard("HandleRedirectPromise exitoso");
          return;
        }

        // 5. Si llegamos aquí sin respuesta, verificar una vez más si hay código
        if (window.location.href.includes('code=')) {
          console.log("✅ CÓDIGO DETECTADO AL FINAL - FORZANDO REDIRECT");
          forceRedirectToDashboard("Código detectado al final");
          return;
        }

        // 6. Si no hay nada, ir al login (o también puedes redirigir al dashboard)
        console.log("❌ No hay evidencia de login exitoso");
        
        // 🔥 OPCIÓN: También redirigir al dashboard si no hay evidencia
        // Descomenta la siguiente línea si prefieres siempre ir al dashboard
        // forceRedirectToDashboard("Sin evidencia de login, redirigiendo al dashboard");
        // return;
        
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (error: any) {
        console.error("💥 Error en handleRedirect:", error.message);
        
        // Usar la función universal de manejo de errores
        if (handleAnyError(error, "handleRedirect principal")) {
          return; // Error manejado
        }
        
        // Para otros errores no manejados, ir al login (o dashboard)
        console.log("⚠️ Error no manejado, redirigiendo al login en 3 segundos");
        
        // 🔥 OPCIÓN: Redirigir al dashboard en lugar del login
        // Descomenta las siguientes líneas para redirigir siempre al dashboard:
        // forceRedirectToDashboard("Error no manejado");
        // return;
        
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    // Interceptar errores globales
    const handleGlobalError = (event: ErrorEvent) => {
      console.log("🌍 Error global capturado:", event.error?.message);
      
      if (handleAnyError(event.error, "error global")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleGlobalRejection = (event: PromiseRejectionEvent) => {
      console.log("🌍 Promise rejection capturada:", event.reason?.message);
      
      if (handleAnyError(event.reason, "promise rejection")) {
        event.preventDefault();
      }
    };

    // Agregar listeners
    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handleGlobalRejection, true);

    // Solo ejecutar cuando MSAL esté listo
    if (inProgress === 'none') {
      handleRedirect();
    }

    // 🔥 TIMEOUT DE SEGURIDAD: Si después de 10 segundos no se ha redirigido, ir al dashboard
    const safetyTimeout = setTimeout(() => {
      if (!redirecting) {
        console.log("⏰ TIMEOUT DE SEGURIDAD - REDIRIGIENDO AL DASHBOARD");
        forceRedirectToDashboard("Timeout de seguridad");
      }
    }, 10000);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError, true);
      window.removeEventListener('unhandledrejection', handleGlobalRejection, true);
      clearTimeout(safetyTimeout);
    };
  }, [instance, accounts, inProgress, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">
        {redirecting ? "🎯 Accediendo al dashboard..." : "🔍 Procesando autenticación..."}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {redirecting ? "Finalizando sesión" : "Verificando credenciales de Microsoft"}
      </p>
            
    </div>
  );
};

export default RedirectPage;