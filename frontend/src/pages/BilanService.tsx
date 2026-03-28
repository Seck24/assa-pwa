import { useState, useEffect } from 'react'
import { api, Sortie, Serveur } from '../api'

export default function BilanService() {
  const [sorties, setSorties] = useState<Sortie[]>([])
  const [serveurs, setServeurs] = useState<Serveur[]>([])
  const [filtre, setFiltre] = useState('Tous')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, srv] = await Promise.all([
      api.post<{ sorties: Sortie[] }>('/sorties/list'),
      api.post<{ serveurs: Serveur[] }>('/serveurs/list'),
    ])
    setSorties(s.sorties || [])
    setServeurs(srv.serveurs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Dédupliquer par produit + filtrer par serveur
  const filtered = (() => {
    const list = filtre === 'Tous' ? sorties : sorties.filter(s => s.serveur_uid === filtre)
    const map = new Map<string, Sortie>()
    for (const s of list) { if (!map.has(s.produit_uid)) map.set(s.produit_uid, s) }
    return [...map.values()]
  })()

  // Calculer les totaux depuis TOUTES les sorties (pas juste filtrées)
  const calcNetSorti = (produit_uid: string) => {
    const list = filtre === 'Tous' ? sorties : sorties.filter(s => s.serveur_uid === filtre)
    return list.filter(s => s.produit_uid === produit_uid).reduce((t, s) => t + (s.quantite_sortie - s.quantite_retour), 0)
  }
  const calcEncaisse = (produit_uid: string) => {
    const list = filtre === 'Tous' ? sorties : sorties.filter(s => s.serveur_uid === filtre)
    return list.filter(s => s.produit_uid === produit_uid).reduce((t, s) => t + s.quantite_encaissee, 0)
  }
  const calcEcart = (produit_uid: string) => calcNetSorti(produit_uid) - calcEncaisse(produit_uid)

  const cloturer = async () => {
    if (!confirm('Clôturer le service ? Toutes les sorties seront supprimées.')) return
    await api.del('/sorties/clear')
    setSorties([])
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="font-bold text-lg">Bilan du service</h2>

      {/* Filtre serveur */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltre('Tous')} className={`px-4 py-2 rounded-full text-xs font-semibold ${filtre === 'Tous' ? 'bg-brand text-dark' : 'glass text-white/50'}`}>Tous</button>
        {serveurs.map(s => (
          <button key={s.uid} onClick={() => setFiltre(s.uid)} className={`px-4 py-2 rounded-full text-xs font-semibold ${filtre === s.uid ? 'bg-brand text-dark' : 'glass text-white/50'}`}>{s.nom}</button>
        ))}
      </div>

      {/* En-tête tableau */}
      <div className="grid grid-cols-4 gap-1 text-[10px] text-white/40 font-semibold px-2">
        <span>Produit</span><span className="text-center">Sortie</span><span className="text-center">Encaissé</span><span className="text-center">Écart</span>
      </div>

      {filtered.length === 0 ? <p className="text-center text-white/30 py-10">Aucune sortie</p>
      : filtered.map(s => {
        const ecart = calcEcart(s.produit_uid)
        return (
          <div key={s.produit_uid} className="glass rounded-xl p-3 grid grid-cols-4 gap-1 items-center">
            <span className="text-sm font-medium truncate">{s.nom_produit}</span>
            <span className="text-center text-sm">{calcNetSorti(s.produit_uid)}</span>
            <span className="text-center text-sm">{calcEncaisse(s.produit_uid)}</span>
            <span className={`text-center text-sm font-bold ${ecart === 0 ? 'text-brand' : ecart < 0 ? 'text-cyan-400' : 'text-red-400'}`}>{ecart}</span>
          </div>
        )
      })}

      {sorties.length > 0 && (
        <button onClick={cloturer} className="w-full btn-brand py-3.5">Clôturer le service</button>
      )}
    </div>
  )
}
