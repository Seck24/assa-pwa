'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getSession, clearSession } from '@/lib/auth';
import Link from 'next/link';

export default function ParametresPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    setSession(s);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      <Header title="PARAMÈTRES" />

      <div className="flex-1 px-4 pt-6 space-y-4">
        {/* Commerce info */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Nom du commerce</p>
            <p className="text-white font-bold text-lg mt-1">{session.nom_commerce}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Téléphone</p>
            <p className="text-white font-medium mt-1">{session.telephone}</p>
          </div>
          {session.account_status && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Statut</p>
              <p className={`font-medium mt-1 capitalize ${
                session.account_status === 'actif' ? 'text-assa-green' :
                session.account_status === 'essai' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {session.account_status}
                {session.account_status === 'essai' && ` — ${session.trial_remaining_days} jour(s) restant(s)`}
              </p>
            </div>
          )}
        </div>

        {/* Lien serveurs */}
        <Link
          href="/serveurs"
          className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-2xl px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">👤</span>
            <span className="text-white font-medium">Gérer les serveurs</span>
          </div>
          <span className="text-gray-400">›</span>
        </Link>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-700 text-white font-bold py-4 rounded-2xl text-base mt-4"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
