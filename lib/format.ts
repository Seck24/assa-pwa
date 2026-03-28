export function formatMoney(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n) + ' F'
}

export function formatDate(raw: string): string {
  if (!raw) return '—'
  const d = new Date(raw)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function genUid(): string {
  return crypto.randomUUID()
}
