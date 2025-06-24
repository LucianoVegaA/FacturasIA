
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated as useMsalIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { AzureLoginButton } from '@/components/auth/AzureLoginButton';
import { useDemoAuth } from '@/context/DemoAuthProvider';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';

const HyperNovaLabsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="hsl(var(--primary))"/>
    <circle cx="24" cy="24" r="14" fill="hsl(var(--accent))" fillOpacity="0.8"/>
    <circle cx="24" cy="24" r="8" fill="hsl(var(--primary))" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { inProgress } = useMsal();
  const msalIsAuthenticated = useMsalIsAuthenticated();
  const { isDemoAuthenticated, loginDemo, loading: demoAuthLoading } = useDemoAuth();

  useEffect(() => {
    if (!demoAuthLoading && inProgress === InteractionStatus.None) {
      if (msalIsAuthenticated || isDemoAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [msalIsAuthenticated, isDemoAuthenticated, demoAuthLoading, inProgress, router]);

  const handleDemoLogin = () => {
    loginDemo();
  };

  const isAuthenticating = demoAuthLoading || inProgress !== InteractionStatus.None;
  const isAuthenticated = msalIsAuthenticated || isDemoAuthenticated;

  if (isAuthenticating || (!isAuthenticating && isAuthenticated)) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Column */}
      <div className="hidden md:flex w-1/3 bg-card p-10 flex-col justify-center items-start space-y-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <HyperNovaLabsIcon />
            <span className="text-3xl font-bold text-primary">Hyper Nova Labs</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground ml-2">HNL Planner</h2>
        </div>
        <div className="mt-auto text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Hyper Nova Labs. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full md:w-2/3 relative flex items-center justify-center p-4">
        <Image
          src="https://placehold.co/1200x800.png"
          alt="Office background"
          fill
          className="absolute inset-0 z-0 object-cover"
          data-ai-hint="office collaboration"
          priority
        />
        {/* Sign-in Card */}
        <div className="relative z-10 bg-card p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-lg space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-muted-foreground">
              Usa tu cuenta de Microsoft o continúa como invitado.
            </p>
          </div>
          
          <AzureLoginButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                O continuar como
              </span>
            </div>
          </div>

          <Button 
            onClick={handleDemoLogin} 
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 py-3"
            size="lg"
          >
            <User className="h-5 w-5" />
            <span>Iniciar sesión como Invitado</span>
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-4">
            Asegurado por Microsoft Azure para cuentas de Microsoft.
          </p>
        </div>
      </div>
    </div>
  );
}
