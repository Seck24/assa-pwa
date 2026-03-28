'use client'
import { useRouter } from 'next/navigation'
import { clearSession } from '@/lib/auth'

const GRID = [
  { icon: '💰', label: 'Ventes',         href: '/app/ventes',   color: 'from-emerald-500/20 to-emerald-500/5' },
  { icon: '📦', label: 'Stock',          href: '/app/stock',    color: 'from-blue-500/20 to-blue-500/5' },
  { icon: '📉', label: 'Dépenses',       href: '/app/depenses', color: 'from-red-500/20 to-red-500/5' },
  { icon: '📋', label: 'Bilan service',  href: '/app/serveurs', color: 'from-amber-500/20 to-amber-500/5' },
  { icon: '📊', label: 'Rapport',        href: '/app/rapport',  color: 'from-purple-500/20 to-purple-500/5' },
  { icon: '⚙️', label: 'Paramètres',     href: '#settings',     color: 'from-gray-500/20 to-gray-500/5' },
]

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold">Bonjour 👋</h1>
        <p className="text-white/40 text-sm mt-1">Que souhaitez-vous faire ?</p>
      </div>

      {/* Quick access grid */}
      <div className="grid grid-cols-2 gap-3">
        {GRID.map(item => (
          <button key={item.label}
            onClick={() => item.href.startsWith('/') ? router.push(item.href) : null}
            className={`glass glass-hover rounded-2xl p-5 flex flex-col items-start gap-3 bg-gradient-to-br ${item.color} transition-all`}>
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-semibold text-white/80">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Déconnexion */}
      <button onClick={() => { clearSession(); router.replace('/login') }}
        className="w-full text-white/20 text-xs py-4">
        Déconnexion
      </button>
    </div>
  )
}
