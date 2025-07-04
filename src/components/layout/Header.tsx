
"use client";

import { Bell, UserCircle, LogOut, LogIn } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useMsal, useIsAuthenticated as useMsalIsAuthenticated } from "@azure/msal-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import type { AccountInfo } from '@azure/msal-browser';
import { useDemoAuth } from '@/context/DemoAuthProvider'; 

export function Header() {
  const { instance, accounts } = useMsal();
  const msalIsAuthenticated = useMsalIsAuthenticated();
  const { isDemoAuthenticated, demoUser, logoutDemo, loading: demoAuthLoading } = useDemoAuth(); 
  const router = useRouter();
  const { toast } = useToast();
  const [activeAccountName, setActiveAccountName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!demoAuthLoading) { 
      if (msalIsAuthenticated && accounts.length > 0) {
        setActiveAccountName(accounts[0].name || accounts[0].username);
        setIsAuthenticated(true);
      } else if (isDemoAuthenticated && demoUser) {
        setActiveAccountName(demoUser.name);
        setIsAuthenticated(true);
      } else {
        setActiveAccountName(null);
        setIsAuthenticated(false);
      }
    }
  }, [msalIsAuthenticated, accounts, isDemoAuthenticated, demoUser, demoAuthLoading]);

  const handleLogout = async () => {
    try {
      if (msalIsAuthenticated) {
        await instance.logoutPopup({
          account: accounts[0] || undefined,
          mainWindowRedirectUri: "/"
        });
      } else if (isDemoAuthenticated) {
        logoutDemo(); 
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Fallo al Cerrar Sesión", description: "No se pudo cerrar la sesión. Por favor, inténtelo de nuevo." });
    }
  };
  
  if (demoAuthLoading && !isAuthenticated) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
     
      <div className="flex-1 flex items-center">
        <h2 className="text-xl font-semibold text-foreground">Facturas</h2>
      </div>


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Alternar notificaciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>No hay notificaciones nuevas</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isAuthenticated && activeAccountName ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-full px-2 py-1 h-auto">
              <UserCircle className="h-6 w-6" />
              <div className="flex flex-col items-start text-xs">
                 <span className="font-medium truncate max-w-[100px]">{activeAccountName}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuItem disabled>{activeAccountName}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Configuración</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Soporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
         <Button variant="outline" onClick={() => router.push('/')}>
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
         </Button>
      )}
    </header>
  );
}
