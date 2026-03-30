// All API calls go through /api/proxy to avoid CORS issues
async function apiPost(endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erreur réseau: ${res.status}`);
  return res.json();
}

async function apiDelete(endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erreur réseau: ${res.status}`);
  return res.json();
}

// AUTH
export const login = (telephone: string, mot_de_passe: string) =>
  apiPost('/login', { telephone, mot_de_passe });

export const checkAccess = (uid: string) =>
  apiPost('/check-access', { uid });

export const resetPassword = (telephone: string, mot_de_passe: string) =>
  apiPost('/reset-password', { telephone, mot_de_passe });

// PRODUITS
export const listProduits = (user_uid: string) =>
  apiPost('/list-produits', { user_uid });

export const createProduit = (data: Record<string, unknown>) =>
  apiPost('/produit-create', data);

export const updateProduit = (data: Record<string, unknown>) =>
  apiPost('/produit-update', data);

export const enregistrerLivraison = (uid: string, user_uid: string, total_unites: number) =>
  apiPost('/enregistrer-livraison', { uid, user_uid, total_unites });

export const enregistrerInventaire = (uid: string, user_uid: string, stock_actuel: number) =>
  apiPost('/enregistrer-inventaire', { uid, user_uid, stock_actuel });

export const deleteProduit = (uid: string, user_uid: string) =>
  apiPost('/delete-produit', { uid, user_uid });

// VENTES
export const createVenteBatch = (data: Record<string, unknown>) =>
  apiPost('/vente-batch', data);

export const listVentes = (user_uid: string, date_debut: string, date_fin: string) =>
  apiPost('/list-ventes', { user_uid, date_debut, date_fin });

// DÉPENSES
export const createDepense = (data: Record<string, unknown>) =>
  apiPost('/depense', data);

export const listDepenses = (user_uid: string, date_debut: string, date_fin: string) =>
  apiPost('/list-depenses', { user_uid, date_debut, date_fin });

// SERVEURS
export const listServeurs = (user_uid: string) =>
  apiPost('/list-serveurs', { user_uid });

export const createServeur = (uid: string, user_uid: string, nom: string) =>
  apiPost('/create-serveur', { uid, user_uid, nom });

export const deleteServeur = (uid: string, user_uid: string) =>
  apiPost('/delete-serveur', { uid, user_uid });

// SORTIES FRIGO
export const createSortie = (data: Record<string, unknown>) =>
  apiPost('/sortie-insert', data);

export const retourSortie = (user_uid: string, serveur_uid: string, produit_uid: string, quantite: number) =>
  apiPost('/sortie-update', { user_uid, serveur_uid, produit_uid, quantite });

export const listSortiesService = (user_uid: string) =>
  apiPost('/list-sorties-service', { user_uid });

export const deleteSorties = (user_uid: string) =>
  apiPost('/delete-sorties', { user_uid });

// RAPPELS
export const listRappels = (user_uid: string) =>
  apiPost('/list-rappels', { user_uid });

export const createRappel = (uid: string, user_uid: string, titre: string, date_limite: string) =>
  apiPost('/create-rappel', { uid, user_uid, titre, date_limite });

export const deleteRappel = (uid: string, user_uid: string) =>
  apiDelete('/delete-rappel', { uid, user_uid });
