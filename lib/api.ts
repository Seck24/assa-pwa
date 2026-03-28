const N8N = 'https://automation.preo-ia.info/webhook'

async function post<T>(path: string, body: object, fallback?: T): Promise<T> {
  const res = await fetch(`${N8N}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!text) {
    if (fallback !== undefined) return fallback
    return {} as T
  }
  try { return JSON.parse(text) as T } catch { return (fallback ?? {}) as T }
}

async function put<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${N8N}/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!text) return { success: true } as T
  try { return JSON.parse(text) as T } catch { return { success: true } as T }
}

async function del<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${N8N}/${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!text) return { success: true } as T
  try { return JSON.parse(text) as T } catch { return { success: true } as T }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export function login(telephone: string, mot_de_passe: string) {
  return post<{ success: boolean; user_uid?: string; telephone?: string; nom_commerce?: string; error?: string }>('login', { telephone, mot_de_passe })
}

export function inscription(telephone: string, mot_de_passe: string, nom_commerce: string, ville_commune: string, nom_complet = '', code_commercial = '') {
  return post<{ success: boolean; user_uid?: string; telephone?: string; nom_commerce?: string; error?: string }>('inscription', { telephone, mot_de_passe, nom_commerce, ville_commune, nom_complet, code_commercial })
}

export function resetPassword(telephone: string, mot_de_passe: string) {
  return post<{ success: boolean; message?: string }>('reset-password', { telephone, mot_de_passe })
}

export function checkAccess(uid: string) {
  return post<{ access_granted: boolean; account_status: string; trial_remaining_days: number; message: string }>('access-check', { uid })
}

export async function activerParCapture(uid: string, telephone: string, image: File) {
  const fd = new FormData()
  fd.append('uid', uid)
  fd.append('telephone', telephone)
  fd.append('capture', image)
  const res = await fetch(`${N8N}/activation-capture`, { method: 'POST', body: fd })
  return res.json() as Promise<{ success: boolean; message: string }>
}

// ── Produits ──────────────────────────────────────────────────────────────────
export interface Produit {
  uid: string; nom: string; stock_actuel: number; unite: string
  prix_vente_defaut: number; seuil_alerte: number; couleur_icone: string
  prix_achat: number; a_formule: boolean; qte_formule: number
  prix_formule: number; categorie_boisson: string
}

export function listProduits(user_uid: string) {
  return post<{ success: boolean; produits: Produit[] }>('list-produits', { user_uid }, { success: true, produits: [] })
}

export function createProduit(data: Record<string, unknown>) {
  return post<{ success: boolean; uid?: string }>('produit-create', data)
}

export function updateProduit(data: Record<string, unknown>) {
  return put<{ success: boolean }>('produit-update', data)
}

export function deleteProduit(uid: string, user_uid: string) {
  return del<{ success: boolean }>('delete-produit', { uid, user_uid })
}

// ── Serveurs ──────────────────────────────────────────────────────────────────
export interface Serveur { uid: string; nom: string }

export function listServeurs(user_uid: string) {
  return post<{ success: boolean; serveurs: Serveur[] }>('list-serveurs', { user_uid }, { success: true, serveurs: [] })
}

export function createServeur(uid: string, user_uid: string, nom: string) {
  return post<{ success: boolean }>('create-serveur', { uid, user_uid, nom })
}

export function deleteServeur(uid: string, user_uid: string) {
  return del<{ success: boolean }>('delete-serveur', { uid, user_uid })
}

// ── Ventes ────────────────────────────────────────────────────────────────────
export interface LignePanier {
  ref_produit_uid: string; nom_affiche: string; prix_unitaire: number
  quantite: number; sous_total: number; mode_vente: string
  serveur_uid: string; nom_serveur: string
}

export function venteBatch(user_uid: string, session_uid: string, serveur_uid: string, nom_serveur: string, lignes: LignePanier[]) {
  return post<{ success: boolean; count?: number }>('vente-batch', { user_uid, session_uid, serveur_uid, nom_serveur, lignes })
}

// ── Dépenses ──────────────────────────────────────────────────────────────────
export function insertDepense(data: { uid: string; user_uid: string; categorie: string; description: string; montant: number; date_depense: string }) {
  return post<{ success: boolean }>('insert-depense', data)
}

export function listDepenses(user_uid: string, date_debut: string, date_fin: string) {
  return post<{ success: boolean; depenses: { uid: string; categorie: string; description: string; montant: number; date_depense: string }[] }>('list-depenses', { user_uid, date_debut, date_fin }, { success: true, depenses: [] })
}

// ── Rapport ───────────────────────────────────────────────────────────────────
export interface Vente { nom_affiche: string; quantite: number; sous_total: number; marge: number }

export function getRapport(user_uid: string, date_debut: string, date_fin: string) {
  return post<{ total_marge: number; total_depenses: number; benefice_net: number; ventes: Vente[]; depenses: { uid: string; categorie: string; description: string; montant: number; date_depense: string }[] }>('assa-rapport', { user_uid, date_debut, date_fin: date_fin + 'T23:59:59' }, { total_marge: 0, total_depenses: 0, benefice_net: 0, ventes: [], depenses: [] })
}

export function getStatsServeurs(user_uid: string, date_debut: string, date_fin: string) {
  return post<{ success: boolean; serveurs: { nom_serveur: string; ca_total: number; nb_ventes: number }[] }>('stats-serveurs', { user_uid, date_debut, date_fin: date_fin + 'T23:59:59' }, { success: true, serveurs: [] })
}

// ── Sorties ───────────────────────────────────────────────────────────────────
export function createSortie(data: { uid: string; user_uid: string; produit_uid: string; nom_produit: string; serveur_uid: string; nom_serveur: string; quantite_sortie: number }) {
  return post<{ success: boolean }>('sortie', data)
}

export function updateSortie(data: { uid: string; user_uid: string; type: 'retour' | 'encaissement'; quantite: number }) {
  return put<{ success: boolean }>('sortie-update', data)
}

export function deleteSorties(user_uid: string) {
  return del<{ success: boolean }>('delete-sorties', { user_uid })
}

// ── Divers ────────────────────────────────────────────────────────────────────
export function effacerDonnees(user_uid: string) {
  return post<{ success: boolean }>('effacer-donnees', { user_uid })
}
