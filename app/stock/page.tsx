'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Snackbar from '@/components/Snackbar';
import Spinner from '@/components/Spinner';
import { getSession } from '@/lib/auth';
import { listProduits, createProduit, updateProduit, deleteProduit, enregistrerLivraison, enregistrerInventaire } from '@/lib/api';
import { genererUid } from '@/lib/utils';

interface Produit {
  uid: string;
  nom: string;
  stock_actuel: number;
  seuil_alerte: number;
  unite?: string;
  couleur_icone?: string;
  categorie_boisson?: string;
  prix_vente_defaut?: number;
  prix_achat?: number;
  a_formule?: boolean;
  qte_formule?: number;
  prix_formule?: number;
}

interface Form {
  nom: string;
  prix_achat: string;
  prix_vente_defaut: string;
  stock_actuel: string;
  seuil_alerte: string;
  a_formule: boolean;
  qte_formule: string;
  prix_formule: string;
  categorie_boisson: 'Alcool' | 'Soft';
  unite: 'Bouteille' | 'Canette' | 'Tournée';
  couleur_icone: string;
}

const emptyForm = (): Form => ({
  nom: '', prix_achat: '', prix_vente_defaut: '', stock_actuel: '', seuil_alerte: '',
  a_formule: false, qte_formule: '', prix_formule: '',
  categorie_boisson: 'Alcool', unite: 'Bouteille', couleur_icone: '#00A650',
});

type ModalType = 'create' | 'edit' | 'livraison' | 'inventaire' | null;

export default function StockPage() {
  const router = useRouter();
  const session = getSession();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Produit | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [livQte, setLivQte] = useState('');
  const [invQte, setInvQte] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Tap detection
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const tapCount = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!session) { router.replace('/login'); return; }
    loadProduits();
  }, []);

  const loadProduits = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await listProduits(session.user_uid);
      setProduits(res.produits || []);
    } catch {
      setSnack({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTap = useCallback((p: Produit) => {
    const key = p.uid;
    tapCount.current[key] = (tapCount.current[key] || 0) + 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      const count = tapCount.current[key];
      tapCount.current[key] = 0;
      if (count >= 2) {
        // Double tap → edit
        setSelected(p);
        setForm({
          nom: p.nom, prix_achat: String(p.prix_achat || ''),
          prix_vente_defaut: String(p.prix_vente_defaut || ''),
          stock_actuel: String(p.stock_actuel),
          seuil_alerte: String(p.seuil_alerte),
          a_formule: p.a_formule || false,
          qte_formule: String(p.qte_formule || ''),
          prix_formule: String(p.prix_formule || ''),
          categorie_boisson: (p.categorie_boisson as 'Alcool' | 'Soft') || 'Alcool',
          unite: (p.unite as 'Bouteille' | 'Canette' | 'Tournée') || 'Bouteille',
          couleur_icone: p.couleur_icone || '#00A650',
        });
        setModal('edit');
      } else {
        // Single tap → livraison
        setSelected(p);
        setLivQte('');
        setModal('livraison');
      }
    }, 300);
  }, []);

  const handleLongPress = (p: Produit) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setSelected(p);
      setInvQte(String(p.stock_actuel));
      setModal('inventaire');
    }, 600);
  };

  const handleLivraison = async () => {
    if (!session || !selected || !livQte) return;
    setSaving(true);
    try {
      await enregistrerLivraison(selected.uid, session.user_uid, parseInt(livQte));
      setModal(null);
      setSnack({ msg: 'Livraison enregistrée ✓', type: 'success' });
      await loadProduits();
    } catch {
      setSnack({ msg: 'Erreur', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleInventaire = async () => {
    if (!session || !selected || !invQte) return;
    setSaving(true);
    try {
      await enregistrerInventaire(selected.uid, session.user_uid, parseInt(invQte));
      setModal(null);
      setSnack({ msg: 'Inventaire mis à jour ✓', type: 'success' });
      await loadProduits();
    } catch {
      setSnack({ msg: 'Erreur', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProduit = async () => {
    if (!session || !form.nom || !form.prix_vente_defaut) {
      setSnack({ msg: 'Nom et prix de vente obligatoires', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const data = {
        uid: selected?.uid || genererUid(),
        user_uid: session.user_uid,
        nom: form.nom,
        prix_achat: parseInt(form.prix_achat) || 0,
        prix_vente_defaut: parseInt(form.prix_vente_defaut),
        stock_actuel: parseInt(form.stock_actuel) || 0,
        seuil_alerte: parseInt(form.seuil_alerte) || 0,
        a_formule: form.a_formule,
        qte_formule: parseInt(form.qte_formule) || 0,
        prix_formule: parseInt(form.prix_formule) || 0,
        categorie_boisson: form.categorie_boisson,
        unite: form.unite,
        couleur_icone: form.couleur_icone,
      };
      if (modal === 'create') {
        await createProduit(data);
        setSnack({ msg: 'Produit créé ✓', type: 'success' });
      } else {
        await updateProduit(data);
        setSnack({ msg: 'Produit modifié ✓', type: 'success' });
      }
      setModal(null);
      setForm(emptyForm());
      setSelected(null);
      await loadProduits();
    } catch {
      setSnack({ msg: 'Erreur lors de la sauvegarde', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Produit) => {
    if (!session) return;
    if (!confirm(`Supprimer ${p.nom} ?`)) return;
    try {
      await deleteProduit(p.uid, session.user_uid);
      await loadProduits();
      setSnack({ msg: 'Produit supprimé', type: 'success' });
    } catch {
      setSnack({ msg: 'Erreur', type: 'error' });
    }
  };

  const enAlerte = produits.filter(p => p.stock_actuel < p.seuil_alerte).length;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      <Header title="STOCK" />

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-900/50 border-b border-gray-800">
        <span className="text-gray-400 text-sm">Etat stock :</span>
        <span className="text-assa-green font-bold text-sm">{produits.length} Produits</span>
        <span className="text-red-400 font-bold text-sm">{enAlerte} En alerte</span>
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 text-gray-400 text-xs space-y-0.5">
        <p>&quot;Clic sur un produit pour enregistrer sa livraison.&quot;</p>
        <p>&quot;Double-clic sur un produit pour le modifier&quot;</p>
        <p>&quot;Appui-long sur un produit pour faire son inventaire&quot;</p>
      </div>

      {/* Liste */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto space-y-3 pt-2">
        {loading ? (
          <div className="flex justify-center pt-12"><Spinner size="lg" /></div>
        ) : (
          produits.map(p => (
            <div
              key={p.uid}
              onClick={() => handleTap(p)}
              onTouchStart={() => handleLongPress(p)}
              onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
              onMouseDown={() => handleLongPress(p)}
              onMouseUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
              className="flex items-center justify-between bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 cursor-pointer active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" style={{ color: p.couleur_icone || '#00A650' }}>🍾</span>
                <div>
                  <p className="text-white font-bold text-base">{p.nom}</p>
                  <p className="text-assa-green text-xs">Inv. {p.seuil_alerte} j</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{p.stock_actuel} {p.unite || 'Bouteille'}</p>
                  <div className="flex justify-end">
                    <span className={`w-3 h-3 rounded-full ${p.stock_actuel < p.seuil_alerte ? 'bg-red-500' : 'bg-assa-green'}`} />
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(p); }}
                  className="text-gray-500 hover:text-red-400 text-lg ml-1"
                >🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bouton créer */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
        <button
          onClick={() => { setForm(emptyForm()); setSelected(null); setModal('create'); }}
          className="bg-assa-green text-white font-bold px-10 py-3 rounded-full text-base shadow-lg"
        >
          Créer produit
        </button>
      </div>

      {/* Modal livraison */}
      {modal === 'livraison' && selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModal(null)} />
          <div className="relative bg-gray-900 rounded-t-3xl p-6 space-y-4">
            <h2 className="text-white font-bold text-xl text-center">Livraison — {selected.nom}</h2>
            <p className="text-gray-400 text-sm text-center">Stock actuel : {selected.stock_actuel}</p>
            <input
              type="number"
              inputMode="numeric"
              value={livQte}
              onChange={e => setLivQte(e.target.value)}
              placeholder="Quantité reçue"
              className="w-full bg-gray-800 border border-assa-green rounded-xl px-4 py-3 text-white text-center text-lg"
            />
            <button onClick={handleLivraison} disabled={saving} className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl">
              {saving ? 'Enregistrement...' : 'Confirmer la livraison'}
            </button>
          </div>
        </div>
      )}

      {/* Modal inventaire */}
      {modal === 'inventaire' && selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModal(null)} />
          <div className="relative bg-gray-900 rounded-t-3xl p-6 space-y-4">
            <h2 className="text-white font-bold text-xl text-center">Inventaire — {selected.nom}</h2>
            <p className="text-gray-400 text-sm text-center">Saisir le stock réel compté</p>
            <input
              type="number"
              inputMode="numeric"
              value={invQte}
              onChange={e => setInvQte(e.target.value)}
              className="w-full bg-gray-800 border border-assa-green rounded-xl px-4 py-3 text-white text-center text-lg"
            />
            <button onClick={handleInventaire} disabled={saving} className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl">
              {saving ? 'Enregistrement...' : 'Mettre à jour le stock'}
            </button>
          </div>
        </div>
      )}

      {/* Modal create/edit produit */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-assa-bg">
          <div className="min-h-screen flex flex-col">
            <div className="flex items-center px-4 py-4 border-b border-gray-800">
              <button onClick={() => setModal(null)} className="text-white text-2xl font-bold mr-3">←</button>
              <h2 className="text-white font-bold text-lg">{modal === 'create' ? 'Nouveau produit' : 'Modifier produit'}</h2>
            </div>
            <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-8">
              {/* Produit */}
              <p className="text-assa-green font-bold text-sm uppercase tracking-wide">PRODUIT</p>
              <input
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom du produit *"
                className="w-full bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 text-white"
              />

              {/* Tarification */}
              <p className="text-assa-green font-bold text-sm uppercase tracking-wide">TARIFICATION</p>
              <input
                value={form.prix_achat}
                onChange={e => setForm({ ...form, prix_achat: e.target.value })}
                inputMode="numeric"
                placeholder="Prix d'achat (FCFA)"
                className="w-full bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 text-white"
              />
              <input
                value={form.prix_vente_defaut}
                onChange={e => setForm({ ...form, prix_vente_defaut: e.target.value })}
                inputMode="numeric"
                placeholder="Prix de vente (FCFA) *"
                className="w-full bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 text-white"
              />

              {/* Stock */}
              <p className="text-assa-green font-bold text-sm uppercase tracking-wide">STOCK</p>
              <input
                value={form.stock_actuel}
                onChange={e => setForm({ ...form, stock_actuel: e.target.value })}
                inputMode="numeric"
                placeholder="Stock initial"
                className="w-full bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 text-white"
              />
              <input
                value={form.seuil_alerte}
                onChange={e => setForm({ ...form, seuil_alerte: e.target.value })}
                inputMode="numeric"
                placeholder="Seuil d'alerte stock"
                className="w-full bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 text-white"
              />

              {/* Formule */}
              <p className="text-assa-green font-bold text-sm uppercase tracking-wide">FORMULE</p>
              <div className="flex items-center justify-between">
                <span className="text-white">Vente en formule ?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, a_formule: false })}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold ${!form.a_formule ? 'border-2 border-assa-green text-white' : 'border border-gray-600 text-gray-400'}`}
                  >Non</button>
                  <button
                    onClick={() => setForm({ ...form, a_formule: true })}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold ${form.a_formule ? 'border-2 border-assa-green text-white' : 'border border-gray-600 text-gray-400'}`}
                  >Oui</button>
                </div>
              </div>
              {form.a_formule && (
                <>
                  <input
                    value={form.qte_formule}
                    onChange={e => setForm({ ...form, qte_formule: e.target.value })}
                    inputMode="numeric"
                    placeholder="Quantité formule"
                    className="w-full bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 text-white"
                  />
                  <input
                    value={form.prix_formule}
                    onChange={e => setForm({ ...form, prix_formule: e.target.value })}
                    inputMode="numeric"
                    placeholder="Prix formule (FCFA)"
                    className="w-full bg-gray-900 border border-assa-green rounded-2xl px-4 py-3 text-white"
                  />
                </>
              )}

              {/* Classification */}
              <p className="text-assa-green font-bold text-sm uppercase tracking-wide">CLASSIFICATION</p>
              <div>
                <p className="text-white text-sm mb-2">Catégorie</p>
                <div className="flex gap-2">
                  {(['Alcool', 'Soft'] as const).map(c => (
                    <button key={c} onClick={() => setForm({ ...form, categorie_boisson: c })}
                      className={`px-4 py-2 rounded-full text-sm font-bold ${form.categorie_boisson === c ? 'bg-assa-green text-white' : 'border border-gray-600 text-gray-300'}`}
                    >{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white text-sm mb-2">Unité de vente</p>
                <div className="flex gap-2 flex-wrap">
                  {(['Bouteille', 'Canette', 'Tournée'] as const).map(u => (
                    <button key={u} onClick={() => setForm({ ...form, unite: u })}
                      className={`px-4 py-2 rounded-full text-sm font-bold ${form.unite === u ? 'border-2 border-assa-green text-white' : 'border border-gray-600 text-gray-300'}`}
                    >{u}</button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveProduit}
                disabled={saving}
                className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base mt-4"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {snack && <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />}
    </div>
  );
}
