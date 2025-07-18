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

console.log('[MSAL Config] Environment variables check:', {
  MSAL_CLIENT_ID_EXISTS: !!MSAL_CLIENT_ID,
  MSAL_CLIENT_ID_LENGTH: MSAL_CLIENT_ID?.length || 0,
  MSAL_TENANT_ID_EXISTS: !!MSAL_TENANT_ID,
  MSAL_TENANT_ID_LENGTH: MSAL_TENANT_ID?.length || 0,
  MSAL_REDIRECT_URI_EXISTS: !!MSAL_REDIRECT_URI,
  MSAL_REDIRECT_URI_VALUE: MSAL_REDIRECT_URI || 'Not set',
  NODE_ENV: process.env.NODE_ENV
});

// Validar variables de entorno críticas
if (!MSAL_CLIENT_ID) {
  console.error('[MSAL Config] NEXT_PUBLIC_AZURE_AD_CLIENT_ID is missing');
  console.error('[MSAL Config] Available env vars:', Object.keys(process.env).filter(key => key.includes('AZURE')));
  throw new Error('NEXT_PUBLIC_AZURE_AD_CLIENT_ID is required');
}

if (!MSAL_TENANT_ID) {
  console.error('[MSAL Config] NEXT_PUBLIC_AZURE_AD_TENANT_ID is missing');
  throw new Error('NEXT_PUBLIC_AZURE_AD_TENANT_ID is required');
}

if (!MSAL_REDIRECT_URI) {
  console.error('[MSAL Config] NEXT_PUBLIC_AZURE_REDIRECT_URI is missing');
  console.log('[MSAL Config] Falling back to default redirect URI for production');
  // Fallback para producción
  const defaultRedirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/redirect`
    : 'https://facturasia-app.azurewebsites.net/auth/redirect';
  console.log('[MSAL Config] Using redirect URI:', defaultRedirectUri);
}

// Determinar redirect URI con fallback
const getRedirectUri = () => {
  console.log('[MSAL Config] getRedirectUri called');
  
  if (MSAL_REDIRECT_URI) {
    console.log('[MSAL Config] Using environment redirect URI:', MSAL_REDIRECT_URI);
    return MSAL_REDIRECT_URI;
  }
  
  // Fallback para producción
  if (typeof window !== 'undefined') {
    const dynamicUri = `${window.location.origin}/auth/redirect`;
    console.log('[MSAL Config] Using dynamic redirect URI:', dynamicUri);
    return dynamicUri;
  }
  
  const fallbackUri = 'https://facturasia-app.azurewebsites.net/auth/redirect';
  console.log('[MSAL Config] Using fallback redirect URI:', fallbackUri);
  return fallbackUri;
};

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
    redirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: false, // Cambiado a false para evitar loops de redirección
    postLogoutRedirectUri: getRedirectUri(), // Usar mismo URI para logout
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
  redirectUri: getRedirectUri(), // Asegurar que use el redirect URI correcto
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
  postLogoutRedirectUri: getRedirectUri(),
};