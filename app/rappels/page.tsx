'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Snackbar from '@/components/Snackbar';
import Spinner from '@/components/Spinner';
import { getSession } from '@/lib/auth';
import { listRappels, createRappel, deleteRappel } from '@/lib/api';
import { genererUid, isOverdue, todayISO } from '@/lib/utils';

interface Rappel {
  uid: string;
  titre: string;
  date_limite: string;
}

export default function RappelsPage() {
  const router = useRouter();
  const session = getSession();
  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [titre, setTitre] = useState('');
  const [dateLimite, setDateLimite] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (!session) { router.replace('/login'); return; }
    loadRappels();
  }, []);

  const loadRappels = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await listRappels(session.user_uid);
      setRappels(res.rappels || []);
    } catch {
      setSnack({ msg: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!session || !titre.trim() || !dateLimite) {
      setSnack({ msg: 'Titre et date obligatoires', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await createRappel(genererUid(), session.user_uid, titre.trim(), dateLimite);
      setTitre('');
      setDateLimite('');
      setShowModal(false);
      await loadRappels();
      setSnack({ msg: 'Rappel créé ✓', type: 'success' });
    } catch {
      setSnack({ msg: 'Erreur', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: Rappel) => {
    if (!session) return;
    try {
      await deleteRappel(r.uid, session.user_uid);
      await loadRappels();
    } catch {
      setSnack({ msg: 'Erreur', type: 'error' });
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      <Header title="RAPPELS" />

      <div className="flex-1 px-4 pt-4 pb-24">
        {loading ? (
          <div className="flex justify-center pt-12"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-3">
            {rappels.length === 0 && (
              <p className="text-gray-400 text-center py-12">Aucun rappel</p>
            )}
            {rappels.map(r => (
              <div
                key={r.uid}
                className={`bg-gray-900 border rounded-2xl p-4 ${isOverdue(r.date_limite) ? 'border-red-500' : 'border-gray-700'}`}
              >
                <p className="text-gray-400 text-sm mb-1">
                  {new Date(r.date_limite).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                </p>
                <p className={`font-bold text-base mb-3 ${isOverdue(r.date_limite) ? 'text-red-400' : 'text-assa-green'}`}>
                  {r.titre}
                </p>
                <div className="flex justify-end">
                  <button onClick={() => handleDelete(r)} className="text-gray-400 hover:text-red-400 text-xl">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-assa-green rounded-full flex items-center justify-center text-white text-3xl shadow-lg"
      >
        +
      </button>

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold text-lg text-center">Nouveau rappel</h3>
            <input
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Titre du rappel"
              className="w-full bg-gray-800 border border-assa-green rounded-xl px-4 py-3 text-white"
            />
            <input
              type="date"
              value={dateLimite}
              min={todayISO()}
              onChange={e => setDateLimite(e.target.value)}
              className="w-full bg-gray-800 border border-assa-green rounded-xl px-4 py-3 text-white"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold">
                Annuler
              </button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 bg-assa-green text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1">
                {saving ? <Spinner size="sm" /> : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {snack && <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />}
    </div>
  );
}
