
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MsalAuthProvider } from '@/components/auth/MsalAuthProvider';
import { DemoAuthProvider } from '@/context/DemoAuthProvider'; // Added
import { GlobalAuthHandler } from '@/components/auth/GlobalAuthHandler';

export const metadata: Metadata = {
  title: 'Invoice Insight',
  description: 'Gestione y analice sus facturas con información impulsada por IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <MsalAuthProvider>
          <GlobalAuthHandler />
          <DemoAuthProvider> {/* Added */}
            {children}
            <Toaster />
          </DemoAuthProvider> {/* Added */}
        </MsalAuthProvider>
      </body>
    </html>
  );
}
