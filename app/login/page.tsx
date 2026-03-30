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

      // API returns 'uid' field (not 'user_uid')
      const userUid = res.uid || res.user_uid;

      // check-access is optional — skip if not available
      let accountStatus: 'essai' | 'actif' | 'suspendu' = 'actif';
      let trialDays = 0;
      let blocked = false;
      try {
        const accessRes = await checkAccess(userUid);
        if (accessRes.access_granted === false) {
          blocked = true;
        }
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

      if (blocked) {
        router.replace('/bloque');
      } else {
        router.replace('/');
      }
    } catch {
      setSnack({ msg: 'Identifiants incorrects ou erreur serveur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-assa-bg flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-10 relative overflow-hidden"
        style={{
          background: 'rgba(0, 230, 118, 0.1)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          boxShadow: '0 0 50px rgba(0, 230, 118, 0.15)',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(0,230,118,0.15) 0%, transparent 60%)' }} />
        <span className="text-assa-green font-bold text-2xl relative z-10">ASSA</span>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {/* Téléphone */}
        <div
          className="flex rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,230,118,0.3)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="flex items-center px-3 text-sm text-white gap-1 whitespace-nowrap"
            style={{ borderRight: '1px solid rgba(0,230,118,0.2)' }}
          >
            🇨🇮 +225
          </div>
          <input
            type="tel"
            value={telephone}
            onChange={e => setTelephone(e.target.value)}
            placeholder="07 00 00 00 00"
            inputMode="numeric"
            className="flex-1 bg-transparent px-3 py-4 text-white placeholder-white/25 text-sm"
          />
        </div>

        {/* Mot de passe */}
        <div
          className="flex rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,230,118,0.3)', backdropFilter: 'blur(10px)' }}
        >
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/25 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="px-4 text-white/40 text-lg"
          >
            {showPwd ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Bouton connexion */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-assa-green text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ color: '#000' }}
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
