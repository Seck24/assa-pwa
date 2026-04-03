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

      const userUid = res.uid || res.user_uid;

      let accountStatus: 'essai' | 'actif' | 'suspendu' = 'actif';
      let trialDays = 0;
      let blocked = false;
      try {
        const accessRes = await checkAccess(userUid);
        if (accessRes.access_granted === false) blocked = true;
        accountStatus = accessRes.account_status || 'actif';
        trialDays = accessRes.trial_remaining_days || 0;
      } catch {
        // check-access not available, assume active
      }

      setSession({
        user_uid: userUid,
        telephone: fullTel,
        nom_commerce: res.nom_commerce || '',
        account_status: accountStatus,
        trial_remaining_days: trialDays,
      });

      if (blocked) router.replace('/bloque');
      else router.replace('/');
    } catch {
      setSnack({ msg: 'Identifiants incorrects ou erreur serveur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">

      {/* ── Logo ───────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center mb-10"
        style={{
          width: 96, height: 96, borderRadius: 28,
          background: 'rgba(0,230,118,0.09)',
          boxShadow: '0 0 60px rgba(0,230,118,0.20), 0 0 0 1px rgba(0,230,118,0.14)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ borderRadius: 28, background: 'linear-gradient(145deg, rgba(0,230,118,0.18) 0%, transparent 60%)' }}
        />
        <span
          className="relative z-10 font-display font-bold text-3xl"
          style={{ color: '#00e676', letterSpacing: '0.08em' }}
        >
          ASSA
        </span>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-3">

        {/* Téléphone */}
        <div
          className="flex overflow-hidden"
          style={{ borderRadius: 16, background: '#1b221b', border: '1px solid rgba(0,230,118,0.18)' }}
        >
          <div
            className="flex items-center px-3 text-sm gap-1 whitespace-nowrap font-body"
            style={{ borderRight: '1px solid rgba(0,230,118,0.12)', color: '#a8c0a8' }}
          >
            🇨🇮 +225
          </div>
          <input
            type="tel"
            value={telephone}
            onChange={e => setTelephone(e.target.value)}
            placeholder="07 00 00 00 00"
            inputMode="numeric"
            className="flex-1 bg-transparent px-3 py-4 text-sm font-body"
            style={{ color: '#d8e8d8' }}
          />
        </div>

        {/* Mot de passe */}
        <div
          className="flex overflow-hidden"
          style={{ borderRadius: 16, background: '#1b221b', border: '1px solid rgba(0,230,118,0.18)' }}
        >
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="flex-1 bg-transparent px-4 py-4 text-sm font-body"
            style={{ color: '#d8e8d8' }}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="px-4 text-lg"
            style={{ color: '#506850' }}
          >
            {showPwd ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Bouton connexion */}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-display font-bold py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          style={{
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #00e676 0%, #00c853 100%)',
            color: '#002d14',
            boxShadow: '0 4px 24px rgba(0,230,118,0.30)',
          }}
        >
          {loading ? <Spinner size="sm" /> : 'Se connecter'}
        </button>

      </form>

      {snack && (
        <Snackbar message={snack.msg} type={snack.type} onClose={() => setSnack(null)} />
      )}
    </div>
  );
}
