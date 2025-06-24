import { PublicClientApplication, LogLevel, type Configuration, type PopupRequest, type RedirectRequest } from "@azure/msal-browser";

const MSAL_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const MSAL_TENANT_ID = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
    navigateToLoginRequestUrl: false, // Important for single-page applications
    redirectUri: "/", // Set a default redirect URI. Must be registered in your Azure AD app registration.
  },
  cache: {
    cacheLocation: "sessionStorage", // "localStorage" or "sessionStorage"
    storeAuthStateInCookie: false, // Set to true if you have issues with Safari ITP
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message); // Too verbose
            return;
          case LogLevel.Verbose:
            // console.debug(message); // Too verbose
            return;
          case LogLevel.Warning:
            console.warn(message);
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

export const msalInstance = new PublicClientApplication(msalConfig);

// Define scopes for login request
export const loginRequest: PopupRequest | RedirectRequest = {
  scopes: ["User.Read", "openid", "profile", "email"], // Basic scopes
};

// Define scopes for acquiring an access token (if you need to call an API)
// export const tokenRequest = {
//   scopes: ["User.Read", "api://<your-api-client-id>/<your-scope>"],
// };
