import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../api'

const PAYS = [
  { code: '+225', flag: '🇨🇮', nom: 'Côte d\'Ivoire' },
  { code: '+223', flag: '🇲🇱', nom: 'Mali' },
  { code: '+226', flag: '🇧🇫', nom: 'Burkina Faso' },
  { code: '+221', flag: '🇸🇳', nom: 'Sénégal' },
  { code: '+228', flag: '🇹🇬', nom: 'Togo' },
  { code: '+229', flag: '🇧🇯', nom: 'Bénin' },
  { code: '+237', flag: '🇨🇲', nom: 'Cameroun' },
  { code: '+243', flag: '🇨🇩', nom: 'RD Congo' },
]

type Tab = 'login' | 'register' | 'reset'

export default function Login() {
  const nav = useNavigate()
  const { setUser } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [pays, setPays] = useState('+225')
  const [showPays, setShowPays] = useState(false)
  const [tel, setTel] = useState('')
  const [mdp, setMdp] = useState('')
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')
  const [nomComplet, setNomComplet] = useState('')
  const [codeCommercial, setCodeCommercial] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const phone = () => {
    const clean = tel.replace(/\D/g, '')
    return pays + (clean.startsWith('0') ? clean.slice(1) : clean)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!tel || !mdp) { setError('Remplissez tous les champs'); return }
    setLoading(true)
    try {
      const r = await api.post<any>('/auth/login', { telephone: phone(), mot_de_passe: mdp })
      if (r.success) {
        setUser({ uid: r.user_uid, nom_commerce: r.nom_commerce, telephone: r.telephone })
        nav('/', { replace: true })
      } else setError(r.error || 'Identifiants incorrects')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!tel || !mdp || !nom) { setError('Champs obligatoires manquants'); return }
    if (mdp.length < 8) { setError('Mot de passe : 8 caractères min'); return }
    setLoading(true)
    try {
      const r = await api.post<any>('/auth/register', {
        telephone: phone(), mot_de_passe: mdp, nom_commerce: nom,
        ville_commune: ville, nom_complet: nomComplet, code_commercial: codeCommercial,
      })
      if (r.success) {
        setUser({ uid: r.user_uid, nom_commerce: r.nom_commerce, telephone: r.telephone })
        nav('/', { replace: true })
      } else setError(r.error || 'Erreur')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!tel || !mdp) { setError('Remplissez tous les champs'); return }
    setLoading(true)
    try {
      const r = await api.post<any>('/auth/reset-password', { telephone: phone(), mot_de_passe: mdp })
      if (r.success) { setSuccess('Mot de passe mis à jour'); setTimeout(() => { setTab('login'); setSuccess('') }, 2000) }
      else setError(r.message || 'Erreur')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const sel = PAYS.find(p => p.code === pays)!

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center mb-6 shadow-lg" style={{ boxShadow: '0 8px 32px rgba(0,200,83,0.3)' }}>
        <span className="text-3xl font-bold text-dark">A</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">ASSA</h1>
      <p className="text-white/40 text-sm mb-8">Gestion de maquis</p>

      <div className="flex gap-1 glass rounded-xl p-1 mb-6 w-full">
        {([['login','Connexion'],['register','Inscription'],['reset','Mot de passe']] as const).map(([k,l]) => (
          <button key={k} onClick={() => { setTab(k); setError(''); setSuccess('') }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${tab===k ? 'bg-brand text-dark' : 'text-white/50'}`}>{l}</button>
        ))}
      </div>

      <div className="w-full mb-3 relative">
        <button onClick={() => setShowPays(!showPays)} className="w-full flex items-center gap-3 glass rounded-xl px-4 py-3.5 text-left">
          <span className="text-xl">{sel.flag}</span>
          <span className="text-white/70 text-sm">{sel.nom}</span>
          <span className="text-brand font-semibold text-sm ml-auto">{sel.code}</span>
        </button>
        {showPays && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 glass rounded-xl max-h-60 overflow-y-auto">
            {PAYS.map(p => (
              <button key={p.code} onClick={() => { setPays(p.code); setShowPays(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5">
                <span>{p.flag}</span><span className="text-sm text-white/70">{p.nom}</span>
                <span className="text-brand text-sm font-medium ml-auto">{p.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={tab==='login' ? handleLogin : tab==='register' ? handleRegister : handleReset} className="w-full space-y-3">
        <input type="tel" placeholder="Numéro de téléphone" value={tel} onChange={e => setTel(e.target.value)} inputMode="tel" />
        {tab === 'register' && <>
          <input placeholder="Nom du commerce *" value={nom} onChange={e => setNom(e.target.value)} />
          <input placeholder="Ville / Commune" value={ville} onChange={e => setVille(e.target.value)} />
          <input placeholder="Nom complet (optionnel)" value={nomComplet} onChange={e => setNomComplet(e.target.value)} />
          <input placeholder="Code commercial (optionnel)" value={codeCommercial} onChange={e => setCodeCommercial(e.target.value)} />
        </>}
        <input type="password" placeholder={tab==='reset' ? 'Nouveau mot de passe' : 'Mot de passe'} value={mdp} onChange={e => setMdp(e.target.value)} />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {success && <p className="text-brand text-sm text-center">{success}</p>}
        <button type="submit" disabled={loading} className="w-full btn-brand py-4 text-base">
          {loading ? '...' : tab==='login' ? 'Se connecter' : tab==='register' ? 'Créer mon compte' : 'Réinitialiser'}
        </button>
      </form>
      {tab === 'login' && <button onClick={() => setTab('reset')} className="mt-4 text-white/30 text-xs">Mot de passe oublié ?</button>}
    </div>
  )
}
