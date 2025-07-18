"use client";

import type { ReactNode } from 'react';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/msalConfig";
import { MsalInitializer } from "./MsalInitializer";

export function MsalAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <MsalInitializer>
        {children}
      </MsalInitializer>
    </MsalProvider>
  );
}
