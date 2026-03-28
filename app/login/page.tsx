'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, inscription, resetPassword } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import { PAYS, buildPhone } from '@/lib/pays'

type Tab = 'login' | 'register' | 'reset'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [pays, setPays] = useState('+225')
  const [tel, setTel] = useState('')
  const [mdp, setMdp] = useState('')
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')
  const [nomComplet, setNomComplet] = useState('')
  const [codeCommercial, setCodeCommercial] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPays, setShowPays] = useState(false)

  function resetForm() {
    setError(''); setSuccess(''); setTel(''); setMdp(''); setNom(''); setVille('')
    setNomComplet(''); setCodeCommercial('')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!tel || !mdp) { setError('Remplissez tous les champs'); return }
    setLoading(true); setError('')
    try {
      const r = await login(buildPhone(pays, tel), mdp)
      if (r.success && r.user_uid) {
        saveSession({ uid: r.user_uid, nom_commerce: r.nom_commerce || '', telephone: r.telephone || '' })
        router.replace('/app')
      } else {
        setError(r.error || 'Identifiants incorrects')
      }
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!tel || !mdp || !nom) { setError('Remplissez les champs obligatoires'); return }
    if (mdp.length < 8) { setError('Mot de passe : 8 caractères minimum'); return }
    setLoading(true); setError('')
    try {
      const r = await inscription(buildPhone(pays, tel), mdp, nom, ville, nomComplet, codeCommercial)
      if (r.success && r.user_uid) {
        saveSession({ uid: r.user_uid, nom_commerce: r.nom_commerce || nom, telephone: r.telephone || '' })
        router.replace('/app')
      } else {
        setError(r.error || 'Erreur lors de l\'inscription')
      }
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!tel || !mdp) { setError('Remplissez tous les champs'); return }
    if (mdp.length < 8) { setError('Nouveau mot de passe : 8 caractères minimum'); return }
    setLoading(true); setError('')
    try {
      const r = await resetPassword(buildPhone(pays, tel), mdp)
      if (r.success) {
        setSuccess('Mot de passe mis à jour. Connectez-vous.')
        setTimeout(() => { setTab('login'); resetForm() }, 2000)
      } else { setError(r.message || 'Erreur') }
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const selectedPays = PAYS.find(p => p.code === pays) || PAYS[0]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8">
      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center mb-6 shadow-lg shadow-brand-glow">
        <span className="text-3xl font-bold text-dark">A</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">ASSA</h1>
      <p className="text-white/40 text-sm mb-8">Gestion de maquis</p>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 mb-6 w-full">
        {([['login', 'Connexion'], ['register', 'Inscription'], ['reset', 'Mot de passe']] as const).map(([key, label]) => (
          <button key={key}
            onClick={() => { setTab(key); resetForm() }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${tab === key ? 'bg-brand text-dark' : 'text-white/50'}`}
          >{label}</button>
        ))}
      </div>

      {/* Sélecteur pays */}
      <div className="w-full mb-3 relative">
        <button onClick={() => setShowPays(!showPays)}
          className="w-full flex items-center gap-3 glass rounded-xl px-4 py-3.5 text-left">
          <span className="text-xl">{selectedPays.flag}</span>
          <span className="text-white/70 text-sm">{selectedPays.nom}</span>
          <span className="text-brand font-semibold text-sm ml-auto">{selectedPays.code}</span>
        </button>
        {showPays && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 glass rounded-xl max-h-60 overflow-y-auto">
            {PAYS.map(p => (
              <button key={p.code} onClick={() => { setPays(p.code); setShowPays(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
                <span>{p.flag}</span>
                <span className="text-sm text-white/70">{p.nom}</span>
                <span className="text-brand text-sm font-medium ml-auto">{p.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Forms */}
      <form onSubmit={tab === 'login' ? handleLogin : tab === 'register' ? handleRegister : handleReset}
        className="w-full space-y-3">
        <input type="tel" placeholder="Numéro de téléphone" value={tel}
          onChange={e => setTel(e.target.value)} inputMode="tel" />

        {tab === 'register' && (
          <>
            <input type="text" placeholder="Nom du commerce *" value={nom} onChange={e => setNom(e.target.value)} />
            <input type="text" placeholder="Ville / Commune" value={ville} onChange={e => setVille(e.target.value)} />
            <input type="text" placeholder="Nom complet (optionnel)" value={nomComplet} onChange={e => setNomComplet(e.target.value)} />
            <input type="text" placeholder="Code commercial (optionnel)" value={codeCommercial} onChange={e => setCodeCommercial(e.target.value)} />
          </>
        )}

        <input type="password" placeholder={tab === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe'}
          value={mdp} onChange={e => setMdp(e.target.value)} />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {success && <p className="text-brand text-sm text-center">{success}</p>}

        <button type="submit" disabled={loading}
          className="w-full btn-brand py-4 text-base disabled:opacity-50">
          {loading ? '...' : tab === 'login' ? 'Se connecter' : tab === 'register' ? 'Créer mon compte' : 'Réinitialiser'}
        </button>
      </form>

      {tab === 'login' && (
        <button onClick={() => { setTab('reset'); resetForm() }}
          className="mt-4 text-white/30 text-xs">Mot de passe oublié ?</button>
      )}
    </div>
  )
}
