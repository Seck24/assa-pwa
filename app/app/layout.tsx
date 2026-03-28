'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { checkAccess } from '@/lib/api'
import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [nom, setNom] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/login'); return }
    setNom(s.nom_commerce)
    setReady(true)
    if (pathname !== '/app/activer') {
      checkAccess(s.uid).then(res => {
        if (!res.access_granted) router.replace('/app/activer')
      }).catch(() => {})
    }
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActiverPage = pathname === '/app/activer'

  return (
    <div className="flex flex-col min-h-screen">
      {!isActiverPage && (
        <header className="flex items-center justify-between px-4 py-3 glass border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
              <span className="text-sm font-bold text-dark">A</span>
            </div>
            <span className="text-brand font-bold text-sm">ASSA</span>
          </div>
          <span className="text-white/50 text-xs truncate max-w-[140px]">{nom}</span>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${isActiverPage ? '' : 'pb-20'}`}>
        {children}
      </main>

      {!isActiverPage && <BottomNav />}
    </div>
  )
}
