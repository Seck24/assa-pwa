export interface Session {
  uid: string
  nom_commerce: string
  telephone: string
}

const KEY = 'assa_session'
const TTL = 24 * 60 * 60 * 1000 // 24h

export function saveSession(s: Session) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify({ ...s, exp: Date.now() + TTL }))
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    if (data.exp && data.exp < Date.now()) { clearSession(); return null }
    return { uid: data.uid, nom_commerce: data.nom_commerce, telephone: data.telephone }
  } catch { return null }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
