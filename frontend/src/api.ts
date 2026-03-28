async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }
  const res = await fetch(`/api${path}`, opts)
  if (res.status === 401) { window.location.href = '/login'; throw new Error('401') }
  const text = await res.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export const api = {
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
}

// ── Types ──
export interface Produit {
  uid: string; nom: string; stock_actuel: number; unite: string
  prix_vente_defaut: number; prix_achat: number; seuil_alerte: number
  couleur_icone: string; a_formule: boolean; qte_formule: number
  prix_formule: number; categorie_boisson: string
}
export interface Serveur { uid: string; nom: string }
export interface Vente { nom_affiche: string; quantite: number; sous_total: number; marge: number }
export interface Depense { uid: string; categorie: string; description: string; montant: number; date_depense: string }
export interface Sortie {
  uid: string; produit_uid: string; nom_produit: string; serveur_uid: string
  nom_serveur: string; quantite_sortie: number; quantite_retour: number; quantite_encaissee: number
}
export interface Rappel { uid: string; titre: string; date_limite: string }
