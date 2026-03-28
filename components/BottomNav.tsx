'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/app',         label: 'Accueil',  icon: '🏠' },
  { href: '/app/ventes',  label: 'Ventes',   icon: '💰' },
  { href: '/app/stock',   label: 'Stock',    icon: '📦' },
  { href: '/app/rapport', label: 'Rapport',  icon: '📊' },
  { href: '/app/serveurs',label: 'Bilan',    icon: '📋' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-white/5 safe-bottom z-50">
      <div className="flex">
        {tabs.map(t => {
          const active = pathname === t.href
          return (
            <Link key={t.href} href={t.href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] transition-colors ${active ? 'text-brand font-semibold' : 'text-white/35'}`}>
              <span className={`text-lg leading-none ${active ? 'drop-shadow-[0_0_6px_rgba(0,200,83,0.5)]' : ''}`}>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
