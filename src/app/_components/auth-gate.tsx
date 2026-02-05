'use client';

import { useAppSelector } from '@store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, role } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'not-authenticated') {
      router.replace('/auth/login');
    }

    if (status === 'first-login-password') {
      router.replace('/auth/first-login-password');
    }

    if (status === 'authenticated' && role !== 'Administrador') {
      router.replace('/not-found');
    }
  }, [status, role, router]);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* <CircProgress /> */}
        Cargando…
      </div>
    );
  }

  if (status !== 'authenticated' || role !== 'Administrador') {
    return null;
  }

  return <>{children}</>;
}
