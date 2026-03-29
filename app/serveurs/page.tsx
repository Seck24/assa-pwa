'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Snackbar from '@/components/Snackbar';
import Spinner from '@/components/Spinner';
import { getSession } from '@/lib/auth';
import { listServeurs, createServeur, deleteServeur } from '@/lib/api';
import { genererUid } from '@/lib/utils';

interface Serveur { uid: string; nom: string; }

export default function ServeursPage() {
  const router = useRouter();
  const session = getSession();
  const [serveurs, setServeurs] = useState<Serveur[]>([]);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (!session) { router.replace('/login'); return; }
    loadServeurs();
  }, []);

  const loadServeurs = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await listServeurs(session.user_uid);
      setServeurs(res.serveurs || []);
    } catch {
      setSnack({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!session || !nom.trim()) return;
    setSaving(true);
    try {
      await createServeur(genererUid(), session.user_uid, nom.trim());
      setNom('');
      await loadServeurs();
      setSnack({ msg: 'Serveur ajouté ✓', type: 'success' });
    } catch {
      setSnack({ msg: 'Erreur', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Serveur) => {
    if (!session) return;
    try {
      await deleteServeur(s.uid, session.user_uid);
      await loadServeurs();
    } catch {
      setSnack({ msg: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      <Header title="SERVEURS" />

      {/* Title */}
      <div className="text-center py-4">
        <h2 className="text-white font-bold text-lg uppercase">GERER SERVEURS</h2>
      </div>

      {/* Liste */}
      <div className="flex-1 px-4 pb-4">
        {loading ? (
          <div className="flex justify-center pt-12"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-3">
            {serveurs.map(s => (
              <div
                key={s.uid}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👤⚙️</span>
                  <span className="text-white font-medium text-lg">{s.nom}</span>
                </div>
                <button
                  onClick={() => handleDelete(s)}
                  className="text-gray-400 hover:text-red-400 text-xl"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire ajout */}
      <div className="px-4 pb-8 space-y-3">
        <input
          value={nom}
          onChange={e => setNom(e.target.value)}
          placeholder="nom"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 py-4 text-white placeholder-gray-500 text-base"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !nom.trim()}
          className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {saving ? <Spinner size="sm" /> : 'Ajouter'}
        </button>
      </div>

      {snack && <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />}
    </div>
  );
}
