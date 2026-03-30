'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listSortiesService, updateEncaissement, deleteSorties } from '@/lib/api';
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
  const [saving, setSaving] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cloturant, setCloturant] = useState(false);
  const [encEdits, setEncEdits] = useState<Record<string, number>>({});
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
      // Init encEdits from DB values
      const edits: Record<string, number> = {};
      data.forEach(s => {
        edits[`${s.produit_uid}-${s.serveur_uid}`] = s.quantite_encaissee;
      });
      setEncEdits(edits);
    } catch {
      setSnack({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Collect unique servers from sorties
  const serveurs = Array.from(
    new Map(sorties.map(s => [s.serveur_uid, s.nom_serveur])).entries()
  ).map(([uid, nom]) => ({ uid, nom }));

  const sortiesFiltrees = filtre === 'tous'
    ? sorties
    : sorties.filter(s => s.serveur_uid === filtre);

  const handleEncChange = (key: string, val: number) => {
    setEncEdits(prev => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const handleSaveEnc = async (s: Sortie) => {
    if (!session) return;
    const key = `${s.produit_uid}-${s.serveur_uid}`;
    const val = encEdits[key] ?? s.quantite_encaissee;
    setSaving(key);
    try {
      await updateEncaissement(session.user_uid, s.serveur_uid, s.produit_uid, val);
      setSorties(prev => prev.map(x =>
        x.produit_uid === s.produit_uid && x.serveur_uid === s.serveur_uid
          ? { ...x, quantite_encaissee: val }
          : x
      ));
      setSnack({ msg: 'Encaissement mis à jour ✓', type: 'success' });
    } catch {
      setSnack({ msg: 'Erreur (workflow non activé ?)', type: 'error' });
    } finally {
      setSaving(null);
    }
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

  const ecartColor = (ecart: number) => {
    if (ecart < 0) return 'text-blue-400';
    if (ecart === 0) return 'text-assa-green';
    return 'text-red-500';
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-gray-800">
        <button onClick={() => router.back()} className="text-white text-2xl font-bold mr-4">←</button>
        <h1 className="text-white font-bold text-lg uppercase tracking-wider">Bilan du Service</h1>
      </div>

      <div className="flex-1 px-4 pt-4 pb-24">
        {/* Filtre serveurs */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2 text-center">Filtrer par serveur</p>
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

        {/* Légende couleurs */}
        <div className="flex gap-4 text-xs mb-3">
          <span className="text-assa-green">● Écart = 0</span>
          <span className="text-blue-400">● Écart &lt; 0 (ok)</span>
          <span className="text-red-500">● Écart &gt; 0 (problème)</span>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="flex justify-center pt-12"><Spinner size="lg" /></div>
        ) : sortiesFiltrees.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Aucune donnée pour ce service</p>
        ) : (
          <div className="space-y-3">
            {sortiesFiltrees.map((s) => {
              const key = `${s.produit_uid}-${s.serveur_uid}`;
              const sortieNette = s.quantite_sortie - s.quantite_retour;
              const encVal = encEdits[key] ?? s.quantite_encaissee;
              const ecart = sortieNette - encVal;
              const changed = encVal !== s.quantite_encaissee;

              return (
                <div key={key} className="bg-gray-900 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{s.nom_produit}</span>
                    <span className="text-gray-400 text-xs">{s.nom_serveur}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
                    <span>Sortie nette</span>
                    <span>Encaissée</span>
                    <span>Écart</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    {/* Sortie nette */}
                    <div className="text-center">
                      <span className="text-white font-bold text-xl">{sortieNette}</span>
                      {s.quantite_retour > 0 && (
                        <p className="text-gray-500 text-xs">{s.quantite_sortie} − {s.quantite_retour}</p>
                      )}
                    </div>

                    {/* Encaissée éditable */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEncChange(key, encVal - 1)}
                        className="w-7 h-7 bg-gray-700 text-white rounded-full text-sm font-bold"
                      >−</button>
                      <input
                        type="number"
                        min={0}
                        value={encVal}
                        onChange={e => handleEncChange(key, parseInt(e.target.value) || 0)}
                        onFocus={e => e.target.select()}
                        className="w-12 text-center bg-gray-800 text-white font-bold text-lg rounded-lg py-0.5 border border-gray-600"
                        inputMode="numeric"
                      />
                      <button
                        onClick={() => handleEncChange(key, encVal + 1)}
                        className="w-7 h-7 bg-assa-green text-white rounded-full text-sm font-bold"
                      >+</button>
                    </div>

                    {/* Écart */}
                    <div className="text-center">
                      <span className={`font-bold text-xl ${ecartColor(ecart)}`}>
                        {ecart > 0 ? `+${ecart}` : ecart}
                      </span>
                    </div>
                  </div>

                  {/* Bouton save si modifié */}
                  {changed && (
                    <button
                      onClick={() => handleSaveEnc(s)}
                      disabled={saving === key}
                      className="w-full bg-assa-green text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {saving === key ? <Spinner size="sm" /> : 'Enregistrer'}
                    </button>
                  )}
                </div>
              );
            })}
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
