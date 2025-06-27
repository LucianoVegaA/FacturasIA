"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
};

export default AuthRedirect;