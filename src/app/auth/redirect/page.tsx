"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect to dashboard - MSAL initialization will handle the auth flow
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;