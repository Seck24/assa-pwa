import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import BottomNav from './BottomNav'

export default function Layout() {
  const { user } = useAuth()
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 glass border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
            <span className="text-sm font-bold text-dark">A</span>
          </div>
          <span className="text-brand font-bold text-sm">ASSA</span>
        </div>
        <span className="text-white/50 text-xs truncate max-w-[140px]">{user?.nom_commerce}</span>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
