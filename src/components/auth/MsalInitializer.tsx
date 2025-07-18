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
        await instance.initialize();
        
        // Handle any pending redirect promise
        const response = await instance.handleRedirectPromise();
        
        if (response && response.account) {
          console.log("MSAL: Login redirect handled successfully:", response.account.username);
          // Set active account
          instance.setActiveAccount(response.account);
          
          // Only redirect if we're on the redirect page or login page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath === "/" || currentPath === "/auth/redirect") {
              console.log("MSAL: Redirecting to dashboard from:", currentPath);
              router.push("/dashboard");
            }
          }
        } else {
          // Check if there are existing accounts
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            instance.setActiveAccount(accounts[0]);
            console.log("MSAL: Active account set:", accounts[0].username);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing MSAL:", error);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeMsal();
    }
  }, [instance, router, isInitialized]);

  // Always render children immediately to avoid hydration issues
  return <>{children}</>;
}