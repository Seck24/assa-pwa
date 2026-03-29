'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, checkAccess } from '@/lib/api';
import { setSession, getSession } from '@/lib/auth';
import Snackbar from '@/components/Snackbar';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) router.replace('/');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telephone || !password) {
      setSnack({ msg: 'Remplis tous les champs', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const fullTel = '+225' + telephone.replace(/\s/g, '');
      const res = await login(fullTel, password);
      if (!res.success) {
        setSnack({ msg: res.message || 'Identifiants incorrects', type: 'error' });
        return;
      }

      const accessRes = await checkAccess(res.user_uid);
      setSession({
        user_uid: res.user_uid,
        telephone: res.telephone,
        nom_commerce: res.nom_commerce,
        account_status: accessRes.access_granted ? (accessRes.account_status || 'actif') : 'suspendu',
        trial_remaining_days: accessRes.trial_remaining_days || 0,
      });

      if (!accessRes.access_granted) {
        router.replace('/bloque');
      } else {
        router.replace('/');
      }
    } catch {
      setSnack({ msg: 'Erreur de connexion. Vérifie ta connexion internet.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-lg">
        <span className="text-assa-green font-bold text-2xl">ASSA</span>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {/* Téléphone */}
        <div className="flex border border-assa-green rounded-2xl overflow-hidden bg-assa-gray">
          <div className="flex items-center px-3 border-r border-assa-green/40 bg-assa-gray/50 text-sm text-white gap-1 whitespace-nowrap">
            🇨🇮 +225
          </div>
          <input
            type="tel"
            value={telephone}
            onChange={e => setTelephone(e.target.value)}
            placeholder="07 00 00 00 00"
            inputMode="numeric"
            className="flex-1 bg-transparent px-3 py-4 text-white placeholder-gray-500 text-sm"
          />
        </div>

        {/* Mot de passe */}
        <div className="flex border border-assa-green rounded-2xl overflow-hidden bg-assa-gray">
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="px-4 text-gray-400 text-lg"
          >
            {showPwd ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Bouton connexion */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Spinner size="sm" /> : 'Se connecter'}
        </button>

        {/* Mot de passe oublié */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push('/login/reset')}
            className="text-gray-400 text-sm underline"
          >
            Mot de passe oublié ?
          </button>
        </div>
      </form>

      {snack && (
        <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />
      )}
    </div>
  );
}
