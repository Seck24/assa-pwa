'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Snackbar from '@/components/Snackbar';
import Spinner from '@/components/Spinner';
import { getSession } from '@/lib/auth';
import { listProduits, listServeurs, createVenteBatch, createSortie, retourSortie } from '@/lib/api';
import { genererUid, formatFCFA } from '@/lib/utils';

interface Produit {
  uid: string;
  nom: string;
  stock_actuel: number;
  prix_vente_defaut: number;
  prix_formule?: number;
  a_formule?: boolean;
  qte_formule?: number;
  couleur_icone?: string;
  categorie_boisson?: string;
}

interface Serveur {
  uid: string;
  nom: string;
}

interface PanierItem {
  produit: Produit;
  quantite: number;
  modeFormule: boolean;
  prix: number;
  sortie_uid?: string;
}

interface Snack {
  msg: string;
  type: 'success' | 'error' | 'warning';
}

export default function VentesPage() {
  const router = useRouter();
  const session = getSession();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [serveurs, setServeurs] = useState<Serveur[]>([]);
  const [serveurActif, setServeurActif] = useState<Serveur | null>(null);
  const [categorie, setCategorie] = useState<'Alcool' | 'Soft'>('Alcool');
  const [loading, setLoading] = useState(true);
  const [panier, setPanier] = useState<PanierItem[]>([]);
  const [snack, setSnack] = useState<Snack | null>(null);
  // Modals
  const [produitModal, setProduitModal] = useState<Produit | null>(null);
  const [modeFormule, setModeFormule] = useState(false);
  const [qteModal, setQteModal] = useState(1);
  const [sortieModal, setSortieModal] = useState<Produit | null>(null);
  const [sortieServeur, setSortieServeur] = useState('');
  const [sortieQte, setSortieQte] = useState(1);
  const [sortieMode, setSortieMode] = useState<'sortie' | 'retour'>('sortie');
  const [panierOpen, setPanierOpen] = useState(false);
  const [serveurPicker, setServeurPicker] = useState(false);
  const [factureOpen, setFactureOpen] = useState(false);
  const [validating, setValidating] = useState(false);

  // Double tap detection
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const tapCount = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!session) { router.replace('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [produitsRes, serveursRes] = await Promise.all([
        listProduits(session.user_uid),
        listServeurs(session.user_uid),
      ]);
      setProduits(produitsRes.produits || []);
      const srvs = serveursRes.serveurs || [];
      setServeurs(srvs);
      if (srvs.length > 0) setServeurActif(srvs[0]);
    } catch {
      setSnack({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const produitsFiltrés = produits.filter(p =>
    (p.categorie_boisson || 'Alcool') === categorie
  );

  // Handle tap / double-tap
  const handleProduitTap = useCallback((p: Produit) => {
    const key = p.uid;
    tapCount.current[key] = (tapCount.current[key] || 0) + 1;

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      const count = tapCount.current[key];
      tapCount.current[key] = 0;
      if (count >= 2) {
        // Double tap → sortie frigo
        setSortieModal(p);
        setSortieServeur(serveurActif?.uid || '');
        setSortieQte(1);
        setSortieMode('sortie');
      } else {
        // Single tap → vente modal
        setProduitModal(p);
        setModeFormule(false);
        setQteModal(1);
      }
    }, 300);
  }, [serveurActif]);

  const totalPanier = panier.reduce((s, i) => s + i.prix * i.quantite, 0);

  const ajouterAuPanier = () => {
    if (!produitModal) return;
    const prix = modeFormule ? (produitModal.prix_formule || 0) : produitModal.prix_vente_defaut;
    const key = `${produitModal.uid}-${modeFormule}`;
    const exists = panier.find(p => `${p.produit.uid}-${p.modeFormule}` === key);
    if (exists) {
      setSnack({ msg: 'Produit déjà dans le panier (même mode)', type: 'warning' });
      setProduitModal(null);
      return;
    }
    setPanier(prev => [...prev, {
      produit: produitModal,
      quantite: qteModal,
      modeFormule,
      prix,
    }]);
    setProduitModal(null);
    setSnack({ msg: '✓ Ajouté au panier', type: 'success' });
  };

  const handleSortie = async () => {
    if (!sortieModal || !session || !sortieServeur) return;
    const srv = serveurs.find(s => s.uid === sortieServeur);
    try {
      if (sortieMode === 'sortie') {
        await createSortie({
          uid: genererUid(),
          user_uid: session.user_uid,
          produit_uid: sortieModal.uid,
          nom_produit: sortieModal.nom,
          serveur_uid: sortieServeur,
          nom_serveur: srv?.nom || '',
          quantite_sortie: sortieQte,
        });
        setSnack({ msg: 'Sortie frigo enregistrée ✓', type: 'success' });
      } else {
        await retourSortie(session.user_uid, sortieServeur, sortieModal.uid, sortieQte);
        setSnack({ msg: 'Retour enregistré ✓', type: 'success' });
      }
      setSortieModal(null);
    } catch {
      setSnack({ msg: `Erreur lors du ${sortieMode === 'retour' ? 'retour' : 'enregistrement'}`, type: 'error' });
    }
  };

  const validerPanier = async () => {
    if (!session || panier.length === 0) return;
    setValidating(true);
    try {
      await createVenteBatch({
        user_uid: session.user_uid,
        session_uid: genererUid(),
        serveur_uid: serveurActif?.uid || '',
        nom_serveur: serveurActif?.nom || '',
        lignes: panier.map(item => ({
          ref_produit_uid: item.produit.uid,
          quantite: item.quantite,
          mode_vente: item.modeFormule ? 'formule' : 'normal',
        })),
      });
      setPanier([]);
      setFactureOpen(false);
      setPanierOpen(false);
      setSnack({ msg: 'Vente enregistrée ✓', type: 'success' });
      await loadData();
    } catch {
      setSnack({ msg: 'Erreur lors de la validation', type: 'error' });
    } finally {
      setValidating(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      <Header title="VENTES" />

      {/* Serveur pill */}
      <div className="px-4 pt-4">
        <button
          onClick={() => setServeurPicker(true)}
          className="w-full bg-assa-green font-bold py-3 px-6 rounded-full flex items-center gap-2 text-base"
        >
          <span className="text-white">👤</span>
          <span className="text-blue-200 font-bold text-lg">{serveurActif?.nom || 'Choisir un serveur'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 px-4 pt-4">
        {(['Alcool', 'Soft'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategorie(cat)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
              categorie === cat
                ? 'bg-assa-green text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-gray-400 text-xs px-4 pt-2">
        Clic sur un produit pour le vendre | Double-clic : sortie frigo
      </p>

      {/* Produits grid */}
      <div className="flex-1 px-4 pt-3 pb-32 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center pt-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {produitsFiltrés.map(p => (
              <button
                key={p.uid}
                onClick={() => handleProduitTap(p)}
                className="relative bg-assa-card rounded-2xl p-3 aspect-square flex flex-col items-center justify-end border-2 active:scale-95 transition-transform"
                style={{ borderColor: p.couleur_icone || '#00A650' }}
              >
                <span
                  className="absolute top-2 left-2 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center"
                  style={{ backgroundColor: '#00A650' }}
                >
                  {p.stock_actuel}
                </span>
                <span className="text-white font-bold text-sm text-center leading-tight">
                  {p.nom}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        {/* Service + Factures */}
        <div className="flex gap-3 px-4 pb-2">
          <button
            onClick={() => router.push('/bilan-service')}
            className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-2xl text-sm"
          >
            Service
          </button>
          <button
            onClick={() => setFactureOpen(true)}
            className="flex-1 bg-assa-green text-white font-bold py-3 rounded-2xl text-sm"
          >
            Factures Enrg.
          </button>
        </div>
        {/* Cart bar */}
        <button
          onClick={() => setPanierOpen(true)}
          className="flex items-center gap-2 px-4 pb-4 w-full"
        >
          <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-lg">
            🛒
          </div>
          <div className="flex-1 bg-assa-green text-white font-bold py-2 rounded-xl text-sm text-center">
            {panier.reduce((s, i) => s + i.quantite, 0)} produit(s)
          </div>
          <div className="flex-1 bg-teal-700 text-white font-bold py-2 rounded-xl text-sm text-center">
            {totalPanier} FCFA
          </div>
        </button>
      </div>

      {/* Drawer: produit modal */}
      {produitModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setProduitModal(null)} />
          <div className="relative bg-gray-900 rounded-t-3xl p-6 space-y-4">
            <h2 className="text-white font-bold text-xl text-center">{produitModal.nom}</h2>
            <p className="text-assa-green text-center font-bold text-lg">
              {formatFCFA(modeFormule ? (produitModal.prix_formule || 0) : produitModal.prix_vente_defaut)}
            </p>

            {produitModal.a_formule && (
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Mode Formule</span>
                <button
                  onClick={() => setModeFormule(!modeFormule)}
                  className={`w-12 h-6 rounded-full transition-colors ${modeFormule ? 'bg-assa-green' : 'bg-gray-600'}`}
                >
                  <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${modeFormule ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQteModal(q => Math.max(1, q - 1))}
                className="w-10 h-10 bg-gray-700 text-white rounded-full text-xl font-bold"
              >−</button>
              <input
                type="number"
                min={1}
                value={qteModal}
                onChange={e => setQteModal(Math.max(1, parseInt(e.target.value) || 1))}
                onFocus={e => e.target.select()}
                className="w-16 text-center bg-gray-800 text-white font-bold text-2xl rounded-xl py-1 border border-gray-600"
                inputMode="numeric"
              />
              <button
                onClick={() => setQteModal(q => q + 1)}
                className="w-10 h-10 bg-assa-green text-white rounded-full text-xl font-bold"
              >+</button>
            </div>

            <button
              onClick={ajouterAuPanier}
              className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      )}

      {/* Drawer: sortie frigo */}
      {sortieModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSortieModal(null)} />
          <div className="relative bg-gray-900 rounded-t-3xl p-6 space-y-4">
            <h2 className="text-white font-bold text-xl text-center">{sortieModal.nom}</h2>

            {/* Onglets Sortie / Retour */}
            <div className="flex rounded-xl overflow-hidden border border-gray-700">
              <button
                onClick={() => setSortieMode('sortie')}
                className={`flex-1 py-2 text-sm font-bold ${sortieMode === 'sortie' ? 'bg-assa-green text-white' : 'bg-gray-800 text-gray-400'}`}
              >Sortie Frigo</button>
              <button
                onClick={() => setSortieMode('retour')}
                className={`flex-1 py-2 text-sm font-bold ${sortieMode === 'retour' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}
              >Retour</button>
            </div>

            <select
              value={sortieServeur}
              onChange={e => setSortieServeur(e.target.value)}
              className="w-full bg-gray-800 text-white border border-assa-green rounded-xl px-4 py-3"
            >
              <option value="">Choisir un serveur</option>
              {serveurs.map(s => (
                <option key={s.uid} value={s.uid}>{s.nom}</option>
              ))}
            </select>

            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setSortieQte(q => Math.max(1, q - 1))} className="w-10 h-10 bg-gray-700 text-white rounded-full text-xl font-bold">−</button>
              <input
                type="number"
                min={1}
                value={sortieQte}
                onChange={e => setSortieQte(Math.max(1, parseInt(e.target.value) || 1))}
                onFocus={e => e.target.select()}
                className="w-16 text-center bg-gray-800 text-white font-bold text-2xl rounded-xl py-1 border border-gray-600"
                inputMode="numeric"
              />
              <button onClick={() => setSortieQte(q => q + 1)} className="w-10 h-10 bg-assa-green text-white rounded-full text-xl font-bold">+</button>
            </div>

            <button
              onClick={handleSortie}
              className={`w-full text-white font-bold py-4 rounded-2xl text-base ${sortieMode === 'retour' ? 'bg-orange-500' : 'bg-assa-green'}`}
            >
              {sortieMode === 'retour' ? 'Enregistrer le retour' : 'Enregistrer la sortie'}
            </button>
          </div>
        </div>
      )}

      {/* Drawer: panier */}
      {panierOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPanierOpen(false)} />
          <div className="relative bg-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-white font-bold text-xl text-center mb-4">🛒 Panier</h2>
            {panier.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Panier vide</p>
            ) : (
              <div className="space-y-3 mb-4">
                {panier.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white font-bold text-sm">{item.produit.nom}</p>
                      <p className="text-gray-400 text-xs">{formatFCFA(item.prix)} × {item.quantite}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-assa-green font-bold">{formatFCFA(item.prix * item.quantite)}</span>
                      <button
                        onClick={() => setPanier(p => p.filter((_, j) => j !== i))}
                        className="text-red-400 text-lg ml-2"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-4 mb-4">
              <span>TOTAL</span>
              <span>{formatFCFA(totalPanier)}</span>
            </div>
            {panier.length > 0 && (
              <button
                onClick={validerPanier}
                disabled={validating}
                className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {validating ? <Spinner size="sm" /> : 'Valider la vente'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Facture drawer */}
      {factureOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFactureOpen(false)} />
          <div className="relative bg-gray-900 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-white font-bold text-xl text-center mb-2">Facture</h2>
            <p className="text-blue-300 font-bold text-sm text-right mb-4">👤 {serveurActif?.nom}</p>
            {panier.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun article</p>
            ) : (
              <div className="space-y-2 mb-4">
                {panier.map((item, i) => (
                  <div key={i} className="flex justify-between text-white text-sm">
                    <span>{item.produit.nom} × {item.quantite}</span>
                    <span>{formatFCFA(item.prix * item.quantite)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-700 pt-4 mb-6">
              <span className="text-white font-bold text-lg">TOTAL</span>
              <div className="bg-gray-800 border border-assa-green rounded-xl px-4 py-2 text-white font-bold">
                {totalPanier} F
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-assa-green text-white font-bold py-3 rounded-xl text-sm">
                Mettre en attente ?
              </button>
              <button
                onClick={validerPanier}
                disabled={validating}
                className="flex-1 bg-assa-green text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1 disabled:opacity-70"
              >
                {validating ? <Spinner size="sm" /> : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Serveur picker */}
      {serveurPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setServeurPicker(false)} />
          <div className="relative bg-gray-900 rounded-t-3xl p-6 space-y-3">
            <h2 className="text-white font-bold text-xl text-center mb-4">Choisir un serveur</h2>
            {serveurs.map(s => (
              <button
                key={s.uid}
                onClick={() => { setServeurActif(s); setServeurPicker(false); }}
                className={`w-full py-3 rounded-xl font-bold text-base ${
                  serveurActif?.uid === s.uid ? 'bg-assa-green text-white' : 'bg-gray-800 text-white'
                }`}
              >
                {s.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {snack && <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />}
    </div>
  );
}
