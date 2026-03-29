'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listServeurs, deleteSorties } from '@/lib/api';
import Spinner from '@/components/Spinner';
import Snackbar from '@/components/Snackbar';

interface Serveur { uid: string; nom: string; }
interface LigneBilan {
  produit: string;
  sortie: number;
  encaisse: number;
  ecart: number;
}

export default function BilanServicePage() {
  const router = useRouter();
  const session = getSession();
  const [serveurs, setServeurs] = useState<Serveur[]>([]);
  const [filtre, setFiltre] = useState<string>('tous');
  const [bilan, setBilan] = useState<LigneBilan[]>([]);
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
      const serveursRes = await listServeurs(session.user_uid);
      setServeurs(serveursRes.serveurs || []);
      // Load sorties from localStorage (stored during service)
      const rawSorties = localStorage.getItem('assa_sorties');
      if (rawSorties) {
        const sorties = JSON.parse(rawSorties);
        setBilan(sorties);
      }
    } catch {
      setSnack({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const bilanFiltre = filtre === 'tous'
    ? bilan
    : bilan.filter(l => l.produit.includes(filtre));

  const handleCloturer = async () => {
    if (!session) return;
    setCloturant(true);
    try {
      await deleteSorties(session.user_uid);
      localStorage.removeItem('assa_sorties');
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

      <div className="flex-1 px-4 pt-4 pb-24">
        {/* Filtre serveurs */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2 text-center">Filtrer serveur(se)</p>
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

        {/* Tableau */}
        {loading ? (
          <div className="flex justify-center pt-12"><Spinner size="lg" /></div>
        ) : (
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-700">
                <th className="text-left py-2">Produit</th>
                <th className="text-center py-2">Qté Sortie</th>
                <th className="text-center py-2">Qté Enc.</th>
                <th className="text-center py-2">Ecart</th>
              </tr>
            </thead>
            <tbody>
              {bilanFiltre.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-gray-400 text-center py-8">Aucune donnée pour ce service</td>
                </tr>
              ) : (
                bilanFiltre.map((ligne, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-3 font-medium">{ligne.produit}</td>
                    <td className="text-center py-3">{ligne.sortie}</td>
                    <td className="text-center py-3">{ligne.encaisse}</td>
                    <td className={`text-center py-3 font-bold ${ligne.ecart > 0 ? 'text-red-500' : 'text-assa-green'}`}>
                      {ligne.ecart}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Bouton clôturer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-assa-bg">
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
