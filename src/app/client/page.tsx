'use client';

import { useAuthStore } from '@hooks';
import { useRouter } from 'next/navigation';

export default function ClientHomePage() {
  const router = useRouter();
  const { onLogout } = useAuthStore()

  const handleGoToSettings = () => {
    router.push('/client/settings');
  };

  const handleLogout = () => {
    onLogout();
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Home</h2>
      <p className="mb-4">Bienvenido a tu panel de cliente.</p>

      <button
        onClick={handleGoToSettings}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Ir a Settings
      </button>

      <button onClick={handleLogout}>Sali</button>
    </div>
  );
}
