'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/auth';

export default function BloquePage() {
  const router = useRouter();
  const session = typeof window !== 'undefined' ? getSession() : null;

  useEffect(() => {
    if (!getSession()) router.replace('/login');
  }, [router]);

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Bonjour, mon accès ASSA est suspendu. Mon commerce : ${session?.nom_commerce || ''} (${session?.telephone || ''}). Merci de réactiver mon compte.`
    );
    window.open(`https://wa.me/2250000000000?text=${msg}`, '_blank');
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-4xl">
        🔒
      </div>
      <h1 className="text-white font-bold text-2xl">Accès suspendu</h1>
      <p className="text-gray-400 text-base max-w-xs">
        Votre licence ASSA a expiré ou a été suspendue. Contactez Préo IA pour réactiver votre compte.
      </p>
      <button
        onClick={handleWhatsApp}
        className="w-full max-w-xs bg-assa-green text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base"
      >
        📱 Contacter sur WhatsApp
      </button>
      <button
        onClick={handleLogout}
        className="text-gray-400 text-sm underline"
      >
        Se déconnecter
      </button>
    </div>
  );
}
