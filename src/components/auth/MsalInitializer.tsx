"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";

export function MsalInitializer({ children }: { children: React.ReactNode }) {
  const { instance } = useMsal();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        console.log('[MsalInitializer] Starting MSAL initialization...');
        console.log('[MsalInitializer] Window location:', typeof window !== 'undefined' ? window.location.href : 'Server-side');
        
        await instance.initialize();
        console.log('[MsalInitializer] MSAL instance initialized successfully');
        
        // Handle any pending redirect promise
        console.log('[MsalInitializer] Handling redirect promise...');
        const response = await instance.handleRedirectPromise();
        console.log('[MsalInitializer] Redirect promise response:', response ? 'Success' : 'No response');
        
        if (response && response.account) {
          console.log("[MsalInitializer] Login redirect handled successfully:", response.account.username);
          console.log("[MsalInitializer] Account details:", {
            username: response.account.username,
            localAccountId: response.account.localAccountId,
            tenantId: response.account.tenantId
          });
          
          // Set active account
          instance.setActiveAccount(response.account);
          console.log("[MsalInitializer] Active account set successfully");
          
          // Only redirect if we're on the redirect page or login page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            console.log("[MsalInitializer] Current path:", currentPath);
            
            if (currentPath === "/" || currentPath === "/auth/redirect") {
              console.log("[MsalInitializer] Redirecting to dashboard from:", currentPath);
              router.push("/dashboard");
            } else {
              console.log("[MsalInitializer] Not redirecting - already on correct path");
            }
          }
        } else {
          console.log("[MsalInitializer] No redirect response, checking existing accounts...");
          
          // Check if there are existing accounts
          const accounts = instance.getAllAccounts();
          console.log(`[MsalInitializer] Found ${accounts.length} existing accounts`);
          
          if (accounts.length > 0) {
            instance.setActiveAccount(accounts[0]);
            console.log("[MsalInitializer] Active account set from existing:", accounts[0].username);
          } else {
            console.log("[MsalInitializer] No existing accounts found");
          }
        }
        
        setIsInitialized(true);
        console.log('[MsalInitializer] Initialization complete');
      } catch (error) {
        console.error("[MsalInitializer] Error initializing MSAL:", error);
        console.error("[MsalInitializer] Error stack:", error.stack);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      console.log('[MsalInitializer] Starting initialization process...');
      initializeMsal();
    } else {
      console.log('[MsalInitializer] Already initialized, skipping...');
    }
  }, [instance, router, isInitialized]);

  // Always render children immediately to avoid hydration issues
  return <>{children}</>;
}