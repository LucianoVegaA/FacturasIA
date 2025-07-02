"use client";

import { 
  PublicClientApplication, 
  LogLevel, 
  type Configuration, 
  type PopupRequest,
  type SilentRequest,
  AccountInfo
} from "@azure/msal-browser";

const MSAL_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID as string;
const MSAL_TENANT_ID = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID as string;
const MSAL_REDIRECT_URI = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI as string;

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
    redirectUri: MSAL_REDIRECT_URI,
    navigateToLoginRequestUrl: true, // Cambiado a true para manejar mejor las redirecciones
    postLogoutRedirectUri: MSAL_REDIRECT_URI, // Agregado para logout
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false, // Considera cambiar a true si tienes problemas con Safari
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Warning // Reducir verbosidad
    },
    allowNativeBroker: false,
    windowHashTimeout: 60000, // Aumentar timeout para popup
    iframeHashTimeout: 6000,
  },
};

// Inicializar MSAL con manejo de errores
export const msalInstance = new PublicClientApplication(msalConfig);

// Inicialización asíncrona con manejo de cuentas existentes
export const initializeMsal = async (): Promise<void> => {
  try {
    await msalInstance.initialize();
    
    // Manejar redirecciones pendientes
    const response = await msalInstance.handleRedirectPromise();
    
    if (response) {
      console.log("Login redirect handled successfully:", response.account?.username);
    }
    
    // Verificar si hay cuentas existentes
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      // Establecer la cuenta activa si existe
      msalInstance.setActiveAccount(accounts[0]);
      console.log("Active account set:", accounts[0].username);
    }
  } catch (error) {
    console.error("Error initializing MSAL:", error);
  }
};

// Configuración de login request
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
  prompt: "select_account", // Permite al usuario seleccionar cuenta
};

// Request para silent token acquisition
export const silentRequest: SilentRequest = {
  scopes: ["User.Read"],
  forceRefresh: false,
};

// Función helper para obtener la cuenta activa
export const getActiveAccount = (): AccountInfo | null => {
  const activeAccount = msalInstance.getActiveAccount();
  if (activeAccount) {
    return activeAccount;
  }
  
  // Si no hay cuenta activa, intentar obtener la primera disponible
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
    return accounts[0];
  }
  
  return null;
};

// Función helper para logout
export const logoutRequest = {
  account: getActiveAccount(),
  postLogoutRedirectUri: MSAL_REDIRECT_URI,
};