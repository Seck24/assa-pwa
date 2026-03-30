'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listSortiesService, deleteSorties } from '@/lib/api';
import Spinner from '@/components/Spinner';
import Snackbar from '@/components/Snackbar';

interface Sortie {
  uid: string;
  produit_uid: string;
  nom_produit: string;
  serveur_uid: string;
  nom_serveur: string;
  quantite_sortie: number;
  quantite_retour: number;
  quantite_encaissee: number;
}

export default function BilanServicePage() {
  const router = useRouter();
  const session = getSession();
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [filtre, setFiltre] = useState<string>('tous');
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cloturant, setCloturant] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (!session) { router.replace('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await listSortiesService(session.user_uid);
      const data: Sortie[] = res?.[0]?.sorties || res?.sorties || [];
      setSorties(data);
    } catch {
      setSnack({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Unique serveurs from sorties data
  const serveurs = Array.from(
    new Map(sorties.map(s => [s.serveur_uid, s.nom_serveur])).entries()
  ).map(([uid, nom]) => ({ uid, nom }));

  // Sorties filtered by current tab
  const sortiesFiltrees = filtre === 'tous' ? sorties : sorties.filter(s => s.serveur_uid === filtre);

  // Group by serveur for display
  const parServeur = serveurs
    .filter(srv => filtre === 'tous' || srv.uid === filtre)
    .map(srv => ({
      ...srv,
      lignes: sortiesFiltrees.filter(s => s.serveur_uid === srv.uid),
    }));

  const ecartColor = (ecart: number) => {
    if (ecart < 0) return 'text-blue-400';
    if (ecart === 0) return 'text-assa-green';
    return 'text-red-500';
  };

  const handleCloturer = async () => {
    if (!session) return;
    setCloturant(true);
    try {
      await deleteSorties(session.user_uid);
      setShowConfirm(false);
      setSnack({ msg: 'Service clôturé ✓', type: 'success' });
      setTimeout(() => router.push('/ventes'), 1500);
    } catch {
      setSnack({ msg: 'Erreur lors de la clôture', type: 'error' });
    } finally {
      setCloturant(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-gray-800">
        <button onClick={() => router.back()} className="text-white text-2xl font-bold mr-4">←</button>
        <h1 className="text-white font-bold text-lg uppercase tracking-wider">Bilan du Service</h1>
      </div>

      <div className="flex-1 px-4 pt-4 pb-28">
        {/* Filtre serveurs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltre('tous')}
              className={`px-4 py-2 rounded-full text-sm font-bold ${filtre === 'tous' ? 'bg-assa-green text-white' : 'bg-gray-800 text-white'}`}
            >
              Tous
            </button>
            {serveurs.map(s => (
              <button
                key={s.uid}
                onClick={() => setFiltre(s.uid)}
                className={`px-4 py-2 rounded-full text-sm font-bold ${filtre === s.uid ? 'bg-assa-green text-white' : 'bg-gray-800 text-white'}`}
              >
                {s.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="flex gap-4 text-xs mb-4">
          <span className="text-assa-green">● 0 = parfait</span>
          <span className="text-blue-400">● négatif = ok</span>
          <span className="text-red-500">● positif = problème</span>
        </div>

        {loading ? (
          <div className="flex justify-center pt-12"><Spinner size="lg" /></div>
        ) : sorties.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Aucune sortie enregistrée pour ce service</p>
        ) : (
          <div className="space-y-6">
            {parServeur.map(srv => (
              <div key={srv.uid}>
                {/* Titre serveur */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-assa-green font-bold text-base">👤 {srv.nom}</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                {/* En-tête tableau */}
                <div className="grid grid-cols-4 text-gray-400 text-xs px-2 mb-1">
                  <span>Produit</span>
                  <span className="text-center">Sortie</span>
                  <span className="text-center">Enc.</span>
                  <span className="text-center">Écart</span>
                </div>

                {/* Lignes */}
                <div className="space-y-1">
                  {srv.lignes.map(s => {
                    const sortieNette = s.quantite_sortie - s.quantite_retour;
                    const ecart = sortieNette - s.quantite_encaissee;
                    return (
                      <div key={s.uid} className="grid grid-cols-4 items-center bg-gray-900 rounded-xl px-3 py-3">
                        <span className="text-white text-sm font-medium">{s.nom_produit}</span>
                        <div className="text-center">
                          <span className="text-white font-bold">{sortieNette}</span>
                          {s.quantite_retour > 0 && (
                            <p className="text-gray-500 text-xs">{s.quantite_sortie}−{s.quantite_retour}</p>
                          )}
                        </div>
                        <span className="text-center text-white font-bold">{s.quantite_encaissee}</span>
                        <span className={`text-center font-bold text-lg ${ecartColor(ecart)}`}>
                          {ecart > 0 ? `+${ecart}` : ecart}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton clôturer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-assa-bg border-t border-gray-800">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base"
        >
          Clôturer le service
        </button>
      </div>

      {/* Modal confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold text-lg text-center">Clôturer le service ?</h3>
            <p className="text-gray-400 text-sm text-center">Toutes les sorties frigo seront effacées. Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold">
                Annuler
              </button>
              <button onClick={handleCloturer} disabled={cloturant} className="flex-1 bg-assa-green text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1">
                {cloturant ? <Spinner size="sm" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {snack && <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />}
    </div>
  );
}
