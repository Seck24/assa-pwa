'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Snackbar from '@/components/Snackbar';
import { getSession } from '@/lib/auth';
import { createDepense } from '@/lib/api';
import { genererUid, todayISO } from '@/lib/utils';

const CATEGORIES = [
  'Loyer', 'Transport', 'Électricité/Eau', 'Téléphone/Internet',
  'Publicité', 'Achat Matériel', 'Autre',
];

export default function DepensesPage() {
  const router = useRouter();
  const session = getSession();
  const [date, setDate] = useState(todayISO());
  const [categorie, setCategorie] = useState('');
  const [description, setDescription] = useState('');
  const [montant, setMontant] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (!session) router.replace('/login');
  }, []);

  const today = todayISO();

  const handleSubmit = async () => {
    if (!session) return;
    if (!categorie || !montant) {
      setSnack({ msg: 'Catégorie et montant obligatoires', type: 'warning' });
      return;
    }
    if (date > today) {
      setSnack({ msg: 'Pas de date future', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await createDepense({
        uid: genererUid(),
        user_uid: session.user_uid,
        categorie,
        description,
        montant: parseInt(montant),
        date_depense: date,
      });
      setCategorie('');
      setDescription('');
      setMontant('');
      setDate(today);
      setSnack({ msg: 'Dépense enregistrée ✓', type: 'success' });
    } catch {
      setSnack({ msg: 'Erreur lors de l\'enregistrement', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col">
      <Header title="DÉPENSES" />

      <div className="flex-1 px-4 pt-4 space-y-4 pb-8">
        {/* Date */}
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">
            {date === today ? "Aujourd'hui" : new Date(date).toLocaleDateString('fr-FR')}
          </span>
          <span className="text-xl">📅</span>
          <input
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            className="bg-transparent text-white border-0 opacity-0 absolute w-8 h-8 cursor-pointer"
          />
        </div>

        {/* Catégorie */}
        <div className="bg-gray-900 border border-assa-green rounded-2xl overflow-hidden">
          <p className="text-white font-medium text-center pt-3 pb-1">Catégorie</p>
          <div className="relative">
            <select
              value={categorie}
              onChange={e => setCategorie(e.target.value)}
              className="w-full bg-transparent text-white px-4 py-3 appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900"></option>
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-gray-900">{c}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-assa-green rounded-lg px-2 py-1 pointer-events-none">
              <span className="text-white text-sm">▼</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900 border border-assa-green rounded-2xl overflow-hidden">
          <p className="text-white font-medium text-center pt-3 pb-1">Description</p>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: payé taxi pour le marché"
            className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3"
          />
        </div>

        {/* Montant */}
        <div className="bg-gray-900 border border-assa-green rounded-2xl overflow-hidden">
          <p className="text-white font-medium text-center pt-3 pb-1">Montant</p>
          <div className="flex items-center px-4 pb-3">
            <input
              value={montant}
              onChange={e => setMontant(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-right text-lg"
            />
            <span className="text-white ml-2 font-medium">FCFA</span>
          </div>
        </div>

        {/* Bouton */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base mt-4 disabled:opacity-70"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {snack && <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />}
    </div>
  );
}
