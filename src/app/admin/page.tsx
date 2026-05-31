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
    <div className="p-8 h-[calc(100vh-64px)] flex items-center justify-center transition-colors duration-500">
      <div className="max-w-2xl w-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-3xl p-10 text-center shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D6405F] to-[#F8BBD0]" />
        <div className="absolute -inset-24 bg-[#D6405F]/5 dark:bg-[#F8BBD0]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <h2 className="text-4xl font-black text-[#40202D] dark:text-white mb-4 relative z-10 tracking-wide drop-shadow-sm">Panel General</h2>
        <p className="text-lg text-[#8C6B79] dark:text-gray-300 font-medium relative z-10">
          Bienvenido al centro de control de <span className="font-bold text-[#D6405F] dark:text-[#F8BBD0]">ESTILOS BOOM</span>. 
          <br/> Selecciona un módulo en el menú lateral para comenzar a gestionar el sistema.
        </p>
      </div>
    </div>
  );
}
