'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listRappels } from '@/lib/api';
import Link from 'next/link';

const menuItems = [
  { label: 'Ventes',      href: '/ventes',     emoji: '💰', glow: 'rgba(0,230,118,0.15)' },
  { label: 'Dépenses',    href: '/depenses',   emoji: '💸', glow: 'rgba(255,80,80,0.12)' },
  { label: 'Stock',       href: '/stock',      emoji: '📦', glow: 'rgba(255,180,0,0.12)' },
  { label: 'Rappels',     href: '/rappels',    emoji: '🔔', glow: 'rgba(255,220,0,0.12)', badge: true },
  { label: 'Paramètres',  href: '/parametres', emoji: '⚙️', glow: 'rgba(150,150,255,0.12)' },
  { label: 'Serveurs',    href: '/serveurs',   emoji: '👥', glow: 'rgba(0,220,255,0.12)' },
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
    <div className="min-h-screen bg-assa-bg flex flex-col items-center px-4 pt-10 pb-8">
      {/* Logo */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden"
        style={{
          background: 'rgba(0, 230, 118, 0.1)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          boxShadow: '0 0 40px rgba(0, 230, 118, 0.15)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(145deg, rgba(0,230,118,0.15) 0%, transparent 60%)',
          }}
        />
        <span className="text-assa-green font-bold text-2xl relative z-10">ASSA</span>
      </div>

      {/* Commerce name */}
      {session.nom_commerce && (
        <p className="text-white font-semibold text-base text-center mb-1">{session.nom_commerce}</p>
      )}
      <p className="text-white/40 text-sm text-center mb-8">Votre maquis &amp; bar sous contrôle</p>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative rounded-2xl aspect-square flex flex-col items-center justify-end pb-3 active:scale-95 transition-transform overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Glow spot */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)` }}
            />
            {/* Shimmer top */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
            />
            <span className="text-4xl mb-1 relative z-10">{item.emoji}</span>
            <span className="text-sm font-bold text-white relative z-10">{item.label}</span>
            {item.badge && rappelCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
                {rappelCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Tip */}
      {tip && (
        <p className="text-white/30 text-xs text-center mt-8 italic px-4">{tip}</p>
      )}

      {/* Trial banner */}
      {session.account_status === 'essai' && session.trial_remaining_days > 0 && (
        <div
          className="mt-6 rounded-xl px-4 py-2 text-sm text-center"
          style={{
            background: 'rgba(255,200,0,0.08)',
            border: '1px solid rgba(255,200,0,0.25)',
            color: 'rgba(255,215,0,0.8)',
          }}
        >
          Essai gratuit : {session.trial_remaining_days} jour(s) restant(s)
        </div>
      )}
    </div>
  );
}
