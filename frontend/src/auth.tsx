import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'

interface User { uid: string; nom_commerce: string; telephone: string }
interface AuthCtx { user: User | null; setUser: (u: User | null) => void; logout: () => void }

const AuthContext = createContext<AuthCtx>({ user: null, setUser: () => {}, logout: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('assa_user') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (user) localStorage.setItem('assa_user', JSON.stringify(user))
    else localStorage.removeItem('assa_user')
  }, [user])

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
