"use client";

import { useMsal, useIsAuthenticated as useMsalIsAuthenticated } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginRequest } from "@/lib/msalConfig";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useDemoAuth } from '@/context/DemoAuthProvider';

export function AzureLoginButton() {
  const { instance, inProgress } = useMsal();
  const msalIsAuthenticated = useMsalIsAuthenticated();
  const { isDemoAuthenticated, loading: demoAuthLoading } = useDemoAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Verificar que MSAL esté listo
      if (inProgress === "none") {
        console.log("Iniciando login redirect...");
        
        // SOLO usar loginRedirect - NO popup
        await instance.loginRedirect(loginRequest);
        
      } else {
        console.warn("MSAL está ocupado:", inProgress);
      }
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  useEffect(() => {
    if (!demoAuthLoading) {
      if (msalIsAuthenticated || isDemoAuthenticated) {
        router.push("/dashboard");
      }
    }
  }, [msalIsAuthenticated, isDemoAuthenticated, demoAuthLoading, router]);

  if (!demoAuthLoading && (msalIsAuthenticated || isDemoAuthenticated)) {
    return null; 
  }

  const isLoading = inProgress !== "none";

  return (
    <Button 
      onClick={handleLogin} 
      className="w-full bg-neutral-900 text-neutral-50 hover:bg-neutral-800 flex items-center justify-center space-x-2 py-3" 
      disabled={isLoading || demoAuthLoading}
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(0 0)" fill="#F25022"/>
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(10.479 0)" fill="#7FBA00"/>
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(0 10.479)" fill="#00A4EF"/>
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(10.479 10.479)" fill="#FFB900"/>
        </svg>
      )}
      <span>Iniciar sesión con Microsoft</span>
    </Button>
  );
}