"use client";

import { 
  PublicClientApplication, 
  LogLevel, 
  type Configuration, 
  type PopupRequest,
  type SilentRequest,
  AccountInfo,
  InteractionRequiredAuthError,
  BrowserAuthError
} from "@azure/msal-browser";

const MSAL_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID as string;
const MSAL_TENANT_ID = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID as string;
const MSAL_REDIRECT_URI = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI as string;

// Validación de variables de entorno
if (!MSAL_CLIENT_ID || !MSAL_TENANT_ID || !MSAL_REDIRECT_URI) {
  console.error("🔴 Missing MSAL environment variables:", {
    clientId: !!MSAL_CLIENT_ID,
    tenantId: !!MSAL_TENANT_ID,
    redirectUri: !!MSAL_REDIRECT_URI,
    actualRedirectUri: MSAL_REDIRECT_URI
  });
}

// Detectar si estamos en Docker/producción
const isDocker = typeof window !== 'undefined' && (
  window.location.hostname === '0.0.0.0' || 
  window.location.hostname === 'localhost' ||
  process.env.NODE_ENV === 'production'
);

console.log("🔍 Environment detection:", {
  isDocker,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  nodeEnv: process.env.NODE_ENV,
  redirectUri: MSAL_REDIRECT_URI
});

// Configuración MSAL optimizada para Docker
export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
    redirectUri: MSAL_REDIRECT_URI,
    navigateToLoginRequestUrl: false,
    postLogoutRedirectUri: MSAL_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage", // localStorage es más persistente en Docker
    storeAuthStateInCookie: true,
    secureCookies: false, // Necesario para Docker en localhost
    temporaryCacheLocation: "sessionStorage", // Fallback
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        
        // Logging mejorado para debugging en Docker
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] MSAL`;
        
        switch (level) {
          case LogLevel.Error:
            // Filtrar errores conocidos y no críticos
            if (
              message.includes("PopupHandler.monitorPopupForHash - window closed") ||
              message.includes("BrowserAuthError: user_cancelled") ||
              message.includes("interaction_in_progress") ||
              message.includes("Token renewal operation failed")
            ) {
              return;
            }
            console.error(`${prefix} ERROR:`, message);
            break;
          case LogLevel.Warning:
            console.warn(`${prefix} WARNING:`, message);
            break;
          case LogLevel.Info:
            // Log info importante para debugging
            if (
              message.includes("handleRedirectPromise") ||
              message.includes("acquireToken") ||
              message.includes("loginRedirect") ||
              message.includes("setActiveAccount")
            ) {
              console.info(`${prefix} INFO:`, message);
            }
            break;
          default:
            break;
        }
      },
      piiLoggingEnabled: false,
      logLevel: isDocker ? LogLevel.Info : LogLevel.Warning, // Más logging en Docker
    },
    allowNativeBroker: false,
    windowHashTimeout: 90000, // Aumentado para Docker
    iframeHashTimeout: 10000, // Aumentado para Docker
    loadFrameTimeout: 10000, // Nuevo para Docker
    // Configuración adicional para Docker
    navigateFrameWait: 0,
    redirectNavigationTimeout: 30000,
  },
};

// Inicializar MSAL con validación
export const msalInstance = new PublicClientApplication(msalConfig);

// Control de inicialización
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Inicialización mejorada para Docker
export const initializeMsal = async (): Promise<void> => {
  // Evitar múltiples inicializaciones concurrentes
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;
  
  initializationPromise = (async () => {
    try {
      console.log("🔄 Initializing MSAL...");
      
      await msalInstance.initialize();
      isInitialized = true;
      
      console.log("✅ MSAL initialized successfully");
      
      // Verificar variables de entorno después de la inicialización
      console.log("🔍 MSAL Config validation:", {
        clientId: MSAL_CLIENT_ID ? "✅" : "❌",
        tenantId: MSAL_TENANT_ID ? "✅" : "❌",
        redirectUri: MSAL_REDIRECT_URI,
        authority: msalConfig.auth.authority
      });
      
      // Manejar redirecciones con timeout
      const handleRedirectWithTimeout = async (): Promise<any> => {
        return Promise.race([
          msalInstance.handleRedirectPromise(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Redirect handling timeout")), 15000)
          )
        ]);
      };
      
      try {
        const response = await handleRedirectWithTimeout();
        
        if (response && response.account) {
          console.log("✅ Login redirect handled successfully:", response.account.username);
          msalInstance.setActiveAccount(response.account);
          
          // Guardar información del usuario como backup
          saveUserBackup(response.account);
          return;
        }
      } catch (redirectError) {
        console.warn("⚠️ Redirect handling failed:", redirectError);
        // Continuar con la validación de cuentas existentes
      }
      
      // Validar cuentas existentes solo si no hay redirect response
      await validateExistingAccounts();
      
    } catch (error) {
      console.error("❌ Error initializing MSAL:", error);
      isInitialized = false;
      initializationPromise = null;
      throw error;
    }
  })();
  
  return initializationPromise;
};

// Guardar backup del usuario
const saveUserBackup = (account: AccountInfo): void => {
  try {
    const userData = {
      username: account.username,
      name: account.name,
      homeAccountId: account.homeAccountId,
      localAccountId: account.localAccountId,
      loginTime: Date.now(),
      tenantId: account.tenantId
    };
    localStorage.setItem('msal_user_backup', JSON.stringify(userData));
    console.log("💾 User backup saved");
  } catch (error) {
    console.warn("⚠️ Failed to save user backup:", error);
  }
};

// Validar cuentas existentes con mejor manejo de errores
const validateExistingAccounts = async (): Promise<void> => {
  try {
    const accounts = msalInstance.getAllAccounts();
    console.log(`🔍 Found ${accounts.length} existing accounts`);
    
    if (accounts.length === 0) {
      // Intentar recuperar desde backup
      await tryRecoverFromBackup();
      return;
    }
    
    // Validar la primera cuenta disponible
    const account = accounts[0];
    console.log("🔍 Validating account:", account.username);
    
    try {
      const silentRequest: SilentRequest = {
        scopes: ["User.Read"],
        account: account,
        forceRefresh: false,
      };
      
      await msalInstance.acquireTokenSilent(silentRequest);
      msalInstance.setActiveAccount(account);
      console.log("✅ Valid existing account found:", account.username);
      
    } catch (tokenError) {
      console.warn("⚠️ Invalid existing account, clearing:", tokenError);
      await clearInvalidAccounts();
    }
    
  } catch (error) {
    console.error("❌ Error validating existing accounts:", error);
  }
};

// Intentar recuperar desde backup
const tryRecoverFromBackup = async (): Promise<void> => {
  try {
    const backupData = localStorage.getItem('msal_user_backup');
    if (!backupData) return;
    
    const userData = JSON.parse(backupData);
    const timeDiff = Date.now() - userData.loginTime;
    
    // Si el login fue hace menos de 2 horas
    if (timeDiff < 7200000) {
      console.log("🔄 Attempting to recover from backup:", userData.username);
      
      // Verificar si MSAL tiene la cuenta en cache
      const accounts = msalInstance.getAllAccounts();
      const matchingAccount = accounts.find(acc => 
        acc.homeAccountId === userData.homeAccountId
      );
      
      if (matchingAccount) {
        msalInstance.setActiveAccount(matchingAccount);
        console.log("✅ Successfully recovered from backup");
      }
    } else {
      // Backup muy viejo, limpiar
      localStorage.removeItem('msal_user_backup');
      console.log("🧹 Cleared old backup data");
    }
  } catch (error) {
    console.warn("⚠️ Failed to recover from backup:", error);
    localStorage.removeItem('msal_user_backup');
  }
};

// Limpiar cuentas inválidas de forma segura
const clearInvalidAccounts = async (): Promise<void> => {
  try {
    console.log("🧹 Clearing invalid accounts...");
    
    // Limpiar storage
    localStorage.removeItem('msal_user_backup');
    
    // En Docker, es mejor hacer logout silencioso
    const accounts = msalInstance.getAllAccounts();
    for (const account of accounts) {
      try {
        await msalInstance.logout({
          account: account,
          onRedirectNavigate: () => false
        });
      } catch (logoutError) {
        console.warn("⚠️ Error during account logout:", logoutError);
      }
    }
    
    console.log("✅ Invalid accounts cleared");
    
  } catch (error) {
    console.error("❌ Error clearing invalid accounts:", error);
  }
};

// Configuración de login optimizada para Docker
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
  prompt: "select_account",
  extraQueryParameters: {
    "domain_hint": "organizations"
  }
};

// Request para silent token acquisition
export const silentRequest: SilentRequest = {
  scopes: ["User.Read"],
  forceRefresh: false,
};

// Función helper mejorada para obtener la cuenta activa
export const getActiveAccount = (): AccountInfo | null => {
  try {
    const activeAccount = msalInstance.getActiveAccount();
    if (activeAccount) {
      return activeAccount;
    }
    
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
      return accounts[0];
    }
    
    return null;
  } catch (error) {
    console.error("❌ Error getting active account:", error);
    return null;
  }
};

// Verificar autenticación con mejor manejo de errores
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    if (!isInitialized) {
      await initializeMsal();
    }
    
    const account = getActiveAccount();
    if (!account) {
      console.log("🔍 No active account found");
      return false;
    }
    
    // Intentar obtener un token válido
    const silentRequest: SilentRequest = {
      scopes: ["User.Read"],
      account: account,
      forceRefresh: false,
    };
    
    await msalInstance.acquireTokenSilent(silentRequest);
    console.log("✅ User is authenticated:", account.username);
    return true;
    
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      console.log("🔐 Interaction required for authentication");
      return false;
    }
    console.error("❌ Error checking authentication:", error);
    return false;
  }
};

// Función de login optimizada para Docker
export const loginUser = async (): Promise<AccountInfo | null> => {
  try {
    console.log("🔐 Starting login process...");
    
    if (!isInitialized) {
      await initializeMsal();
    }
    
    // Verificar si ya hay una sesión válida
    const isAuthenticated = await isUserAuthenticated();
    if (isAuthenticated) {
      const account = getActiveAccount();
      console.log("✅ User already authenticated:", account?.username);
      return account;
    }
    
    console.log("🔐 Starting interactive login...");
    
    // En Docker, usar siempre redirect para mejor compatibilidad
    await msalInstance.loginRedirect(loginRequest);
    
    // loginRedirect causa navegación, la función termina aquí
    return null;
    
  } catch (error) {
    console.error("❌ Login error:", error);
    
    if (error instanceof BrowserAuthError) {
      if (error.errorCode === "user_cancelled") {
        console.log("👤 User cancelled login");
        return null;
      }
      if (error.errorCode === "interaction_in_progress") {
        console.log("🔄 Another login is in progress");
        return null;
      }
    }
    
    throw error;
  }
};

// Función de logout mejorada para Docker
export const logoutUser = async (): Promise<void> => {
  try {
    console.log("🚪 Starting logout process...");
    
    const account = getActiveAccount();
    if (account) {
      console.log("🚪 Logging out user:", account.username);
      
      // En Docker, usar redirect es más confiable
      await msalInstance.logoutRedirect({
        account: account,
        postLogoutRedirectUri: MSAL_REDIRECT_URI,
      });
    }
    
    // Limpiar storage local
    localStorage.removeItem('msal_user_backup');
    console.log("✅ Logout successful");
    
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Forzar limpieza local si falla el logout
    localStorage.removeItem('msal_user_backup');
    throw error;
  }
};

// Función helper para obtener token de acceso
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const account = getActiveAccount();
    if (!account) {
      console.log("🔍 No account available for token acquisition");
      return null;
    }
    
    const silentRequest: SilentRequest = {
      scopes: ["User.Read"],
      account: account,
      forceRefresh: false,
    };
    
    const response = await msalInstance.acquireTokenSilent(silentRequest);
    console.log("✅ Access token acquired successfully");
    return response.accessToken;
    
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      console.log("🔐 Token expired, interaction required");
      return null;
    }
    console.error("❌ Error getting access token:", error);
    return null;
  }
};

// Configuración de logout
export const logoutRequest = {
  account: getActiveAccount(),
  postLogoutRedirectUri: MSAL_REDIRECT_URI,
};