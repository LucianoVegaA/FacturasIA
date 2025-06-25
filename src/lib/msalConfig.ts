"use client";

import { PublicClientApplication, LogLevel, type Configuration, type RedirectRequest, BrowserAuthOptions } from "@azure/msal-browser";

const MSAL_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID as string;

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    navigateToLoginRequestUrl: true, // Important for single-page applications
    redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI, // Use the configured redirect URI
  },
  cache: {
    cacheLocation: "localStorage", // Change to localStorage for web applications
    storeAuthStateInCookie: true,  // Helps with web applications
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            // Suppress the "window closed" error as it's a user action, not a system error.
            if (message.includes("PopupHandler.monitorPopupForHash - window closed")) {
              return;
            }
            console.error("MSAL Error:", message);
            return;
          case LogLevel.Info:
            // console.info(message); // Too verbose
            return;
          case LogLevel.Verbose:
            // console.debug(message); // Too verbose
            return;
          case LogLevel.Warning:
            console.warn("MSAL Warning:", message);
            return;
          default:
            return;
        }
      },
      piiLoggingEnabled: false
    },
    allowNativeBroker: false // Disables WAM Broker
  },
};

// Crear la instancia
export const msalInstance = new PublicClientApplication(msalConfig);

// IMPORTANTE: Inicializar MSAL antes de usar
let msalInitialized = false;

export const initializeMsal = async () => {
  if (!msalInitialized) {
    console.log("Inicializando MSAL...");
    try {
      await msalInstance.initialize();
      msalInitialized = true;
      console.log("MSAL inicializado correctamente");
    } catch (error) {
      console.error("Error inicializando MSAL:", error);
      throw error;
    }
  }
  return msalInstance;
};

// CAMBIO: Usar RedirectRequest en lugar de PopupRequest
export const loginRequest: RedirectRequest = {
  scopes: ["User.Read", "openid", "profile", "email"], // Basic scopes
};

// Define scopes for acquiring an access token (if you need to call an API)
// export const tokenRequest = {
//   scopes: ["User.Read", "api://<your-api-client-id>/<your-scope>"],
// };