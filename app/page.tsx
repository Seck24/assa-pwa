'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listRappels } from '@/lib/api';
import Link from 'next/link';

const menuItems = [
  { label: 'Ventes',      href: '/ventes',     emoji: '💰', badge: false },
  { label: 'Dépenses',    href: '/depenses',   emoji: '💸', badge: false },
  { label: 'Stock',       href: '/stock',      emoji: '📦', badge: false },
  { label: 'Rappels',     href: '/rappels',    emoji: '🔔', badge: true },
  { label: 'Paramètres',  href: '/parametres', emoji: '⚙️', badge: false },
  { label: 'Serveurs',    href: '/serveurs',   emoji: '👥', badge: false },
];

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [rappelCount, setRappelCount] = useState(0);
  const tip = '"Créer vos produits dans l\'écran Stock"';

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

  }, [router]);

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-10" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 40px)' }}>

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center mb-3"
        style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'rgba(0,230,118,0.09)',
          boxShadow: '0 0 52px rgba(0,230,118,0.18), 0 0 0 1px rgba(0,230,118,0.14)',
        }}
      >
        <div className="absolute inset-0" style={{ borderRadius: 24, background: 'linear-gradient(145deg, rgba(0,230,118,0.16) 0%, transparent 60%)' }} />
        <span className="relative z-10 font-display font-bold text-2xl" style={{ color: '#00e676', letterSpacing: '0.06em' }}>ASSA</span>
      </div>

      {/* Commerce name */}
      {session.nom_commerce && (
        <p className="font-display font-bold text-lg text-center mb-0.5" style={{ color: '#d8e8d8' }}>{session.nom_commerce}</p>
      )}
      <p className="text-xs text-center mb-6 font-body" style={{ color: '#6a8a6a' }}>Votre maquis &amp; bar sous contrôle</p>

      {/* ── Kéguénou accent bar ───────────────────────────────────── */}
      <div className="w-full max-w-sm mb-5">
        <div className="h-px w-full rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.25), transparent)' }} />
      </div>

      {/* ── Grid 2×3 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-start justify-between p-4 active:scale-95 transition-transform overflow-hidden"
            style={{ borderRadius: 20, background: '#1b221b', minHeight: 108 }}
          >
            {/* Shimmer */}
            <div className="absolute top-0 left-[8%] right-[8%] h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.10), transparent)' }} />
            {/* Badge */}
            {item.badge && rappelCount > 0 && (
              <span className="absolute top-3 right-3 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10" style={{ background: '#ff3d3d', boxShadow: '0 2px 8px rgba(255,61,61,0.4)' }}>
                {rappelCount}
              </span>
            )}
            <span className="text-3xl relative z-10">{item.emoji}</span>
            <span className="font-display font-bold text-sm relative z-10" style={{ color: '#d8e8d8' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Tip */}
      {tip && (
        <p className="text-xs text-center mt-6 italic px-4 font-body" style={{ color: '#506850' }}>{tip}</p>
      )}

      {/* Trial banner */}
      {session.account_status === 'essai' && session.trial_remaining_days > 0 && (
        <div
          className="mt-5 rounded-full px-4 py-1.5 text-xs text-center font-body font-medium"
          style={{ background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.18)', color: 'rgba(255,215,0,0.7)' }}
        >
          Essai gratuit · {session.trial_remaining_days} jour(s) restant(s)
        </div>
      )}
    </div>
  );
}
