"use client";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginRequest } from "@/lib/msalConfig";
import { LogIn, Loader2 } from "lucide-react";
import { useEffect } from "react";

export function AzureLoginButton() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  const handleLogin = () => {
    if (inProgress === "none") {
      instance.loginRedirect(loginRequest).catch(e => {
        console.error("MSAL Login Error:", e);
        // Potentially show an error toast to the user
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    // Optionally, you can show a message or redirect if already authenticated
    // For this button, it's usually just hidden or disabled if auth state is managed elsewhere
    return null; 
  }

  const isLoading = inProgress !== "none";

  return (
    <Button 
      onClick={handleLogin} 
      className="w-full max-w-xs mx-auto" 
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        // Using a simple Microsoft logo SVG as lucide-react doesn't have one
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="mr-2">
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(0 0)" fill="#F25022"/>
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(10.479 0)" fill="#7FBA00"/>
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(0 10.479)" fill="#00A4EF"/>
          <path d="M0 0H9.521V9.521H0V0Z" transform="translate(10.479 10.479)" fill="#FFB900"/>
        </svg>
      )}
      Sign in with Microsoft
    </Button>
  );
}
