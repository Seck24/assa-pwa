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

async function apiPut(endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
    method: 'PUT',
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
  apiPut('/produit-update', data);

export const deleteProduit = (uid: string, user_uid: string) =>
  apiDelete('/delete-produit', { uid, user_uid });

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
  apiDelete('/delete-serveur', { uid, user_uid });

// SORTIES FRIGO
export const createSortie = (data: Record<string, unknown>) =>
  apiPost('/sortie', data);

export const updateSortie = (uid: string, user_uid: string, type: 'retour' | 'encaissement', quantite: number) =>
  apiPut('/sortie-update', { uid, user_uid, type, quantite });

export const deleteSorties = (user_uid: string) =>
  apiDelete('/delete-sorties', { user_uid });

// RAPPELS
export const listRappels = (user_uid: string) =>
  apiPost('/list-rappels', { user_uid });

export const createRappel = (uid: string, user_uid: string, titre: string, date_limite: string) =>
  apiPost('/rappel', { uid, user_uid, titre, date_limite });

export const deleteRappel = (uid: string, user_uid: string) =>
  apiDelete('/rappel', { uid, user_uid });
