"use client";

import { useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { AuthenticationResult } from '@azure/msal-browser';

export function GlobalAuthHandler() {
  const { instance } = useMsal();

  useEffect(() => {
    // Manejar redirects automáticamente cuando la app se carga
    instance.handleRedirectPromise()
      .then((response: AuthenticationResult | null) => {
        if (response) {
          console.log("Redirect manejado globalmente:", response);
        }
      })
      .catch((error) => {
        console.error("Error en redirect global:", error);
      });
  }, [instance]);

  return null; // No renderiza nada
}