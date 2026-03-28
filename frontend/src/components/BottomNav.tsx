import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',       label: 'Accueil', icon: '🏠' },
  { to: '/ventes', label: 'Ventes',  icon: '💰' },
  { to: '/stock',  label: 'Stock',   icon: '📦' },
  { to: '/rapport',label: 'Rapport', icon: '📊' },
  { to: '/bilan',  label: 'Bilan',   icon: '📋' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-white/5 safe-bottom z-50">
      <div className="flex">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] transition-colors ${isActive ? 'text-brand font-semibold' : 'text-white/35'}`
            }>
            {({ isActive }) => (
              <>
                <span className={`text-lg leading-none ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,200,83,0.5)]' : ''}`}>{t.icon}</span>
                <span>{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
