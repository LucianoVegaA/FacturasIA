"use client";

import { Bell, UserCircle, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import type { AccountInfo } from '@azure/msal-browser';

export function Header() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const { toast } = useToast();
  const [activeAccount, setActiveAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      setActiveAccount(accounts[0]);
    } else {
      setActiveAccount(null);
    }
  }, [isAuthenticated, accounts]);

  const handleLogout = async () => {
    try {
      await instance.logoutRedirect({
        account: activeAccount,
        postLogoutRedirectUri: "/", // Redirect to home page after logout
      });
      // MSAL handles redirect, so toast might not be visible.
      // toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out. Please try again." });
    }
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
     
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>

      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search invoices..."
          className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isAuthenticated && activeAccount ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-full px-2 py-1 h-auto">
              <UserCircle className="h-6 w-6" />
              <div className="flex flex-col items-start text-xs">
                 <span className="font-medium truncate max-w-[100px]">{activeAccount.name || activeAccount.username}</span>
                 {/* <span className="text-muted-foreground truncate max-w-[100px]">{activeAccount.username}</span> */}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem disabled>{activeAccount.name || activeAccount.username}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
         <Button variant="outline" onClick={() => router.push('/')}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
         </Button>
      )}
    </header>
  );
}
