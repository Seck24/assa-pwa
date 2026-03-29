'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listRappels } from '@/lib/api';
import Link from 'next/link';

const menuItems = [
  {
    label: 'Ventes',
    href: '/ventes',
    bg: 'bg-teal-700',
    icon: '🏧',
    emoji: '💰',
  },
  {
    label: 'Dépenses',
    href: '/depenses',
    bg: 'bg-red-700',
    icon: '💸',
    emoji: '📤',
  },
  {
    label: 'Stock',
    href: '/stock',
    bg: 'bg-amber-800',
    icon: '🍾',
    emoji: '📦',
  },
  {
    label: 'Rappels',
    href: '/rappels',
    bg: 'bg-yellow-600',
    icon: '📋',
    emoji: '🔔',
    badge: true,
  },
  {
    label: 'Paramètres',
    href: '/parametres',
    bg: 'bg-gray-200',
    textColor: 'text-gray-800',
    icon: '⚙️',
    emoji: '⚙️',
  },
  {
    label: 'Serveurs',
    href: '/serveurs',
    bg: 'bg-teal-600',
    icon: '🍸',
    emoji: '👩‍🍳',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [rappelCount, setRappelCount] = useState(0);
  const [tip, setTip] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    setSession(s);
    // Load rappels count
    listRappels(s.user_uid)
      .then(r => setRappelCount(r.rappels?.length || 0))
      .catch(() => {});

    const tips = [
      '"Créer produit dans écran stock"',
      '"Double-clic sur un produit pour sortie frigo"',
      '"Gérer tes serveurs depuis le menu Serveurs"',
    ];
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, [router]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col items-center px-4 pt-8 pb-6">
      {/* Logo */}
      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        <span className="text-assa-green font-bold text-xl">ASSA</span>
      </div>

      {/* Tagline */}
      <p className="text-white font-bold text-lg text-center mb-8">
        Votre maquis &amp; bar sous contrôle !
      </p>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative ${item.bg} rounded-2xl aspect-square flex flex-col items-center justify-end pb-3 shadow-lg active:scale-95 transition-transform`}
          >
            <span className="text-4xl mb-1">{item.emoji}</span>
            <span className={`text-sm font-bold ${item.textColor || 'text-white'}`}>
              {item.label}
            </span>
            {item.badge && rappelCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {rappelCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Tip */}
      {tip && (
        <p className="text-gray-400 text-sm text-center mt-8 italic px-4">
          {tip}
        </p>
      )}

      {/* Trial banner */}
      {session.account_status === 'essai' && session.trial_remaining_days > 0 && (
        <div className="mt-6 bg-yellow-900/40 border border-yellow-600 rounded-xl px-4 py-2 text-yellow-400 text-sm text-center">
          Essai gratuit : {session.trial_remaining_days} jour(s) restant(s)
        </div>
      )}
    </div>
  );
}
