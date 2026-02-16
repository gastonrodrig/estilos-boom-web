// src/app/(admin)/dashboard/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@store';
import { useEffect } from 'react';
import { FullScreenLoader } from '@/components/organisms';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "not-authenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status === "checking" || status === "not-authenticated") {
    return <FullScreenLoader />;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
      <p>Bienvenido al panel de administración.</p>
    </div>
  );
}
