import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

const GRID = [
  { icon: '💰', label: 'Ventes',        to: '/ventes',  color: 'from-emerald-500/20 to-emerald-500/5' },
  { icon: '📦', label: 'Stock',         to: '/stock',   color: 'from-blue-500/20 to-blue-500/5' },
  { icon: '📉', label: 'Dépenses',      to: '/depenses',color: 'from-red-500/20 to-red-500/5' },
  { icon: '📋', label: 'Bilan service', to: '/bilan',   color: 'from-amber-500/20 to-amber-500/5' },
  { icon: '📊', label: 'Rapport',       to: '/rapport', color: 'from-purple-500/20 to-purple-500/5' },
  { icon: '⚙️', label: 'Paramètres',    to: '',         color: 'from-gray-500/20 to-gray-500/5' },
]

export default function Home() {
  const nav = useNavigate()
  const { user, logout } = useAuth()
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Bonjour 👋</h1>
        <p className="text-white/40 text-sm mt-1">{user?.nom_commerce}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GRID.map(g => (
          <button key={g.label} onClick={() => g.to && nav(g.to)}
            className={`glass glass-active rounded-2xl p-5 flex flex-col items-start gap-3 bg-gradient-to-br ${g.color} transition-all`}>
            <span className="text-2xl">{g.icon}</span>
            <span className="text-sm font-semibold text-white/80">{g.label}</span>
          </button>
        ))}
      </div>
      <button onClick={() => { logout(); nav('/login', { replace: true }) }} className="w-full text-white/20 text-xs py-4">Déconnexion</button>
    </div>
  )
}
