"use client";

import type { ReactNode } from 'react';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/msalConfig";
import type { EventMessage, EventType } from '@azure/msal-browser';

// Optional: You can handle MSAL events here if needed
msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === "msal:loginSuccess" && event.payload) {
    // const payload = event.payload as AuthenticationResult;
    // const account = payload.account;
    // msalInstance.setActiveAccount(account);
    // console.log("Login success, account set:", account);
  }
});


export function MsalAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}
