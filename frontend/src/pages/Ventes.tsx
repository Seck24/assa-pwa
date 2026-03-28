import { useState, useEffect } from 'react'
import { api, Produit, Serveur } from '../api'

interface CartItem {
  produit: Produit; quantite: number; mode: 'normal' | 'formule'
}

export default function Ventes() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [serveurs, setServeurs] = useState<Serveur[]>([])
  const [serveur, setServeur] = useState<Serveur | null>(null)
  const [tab, setTab] = useState<'Alcool' | 'Soft'>('Alcool')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    Promise.all([
      api.post<{ produits: Produit[] }>('/produits/list'),
      api.post<{ serveurs: Serveur[] }>('/serveurs/list'),
    ]).then(([p, s]) => {
      setProduits(p.produits || [])
      setServeurs(s.serveurs || [])
      if (s.serveurs?.length) setServeur(s.serveurs[0])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = produits.filter(p => p.categorie_boisson === tab)
  const cartTotal = cart.reduce((s, c) => {
    if (c.mode === 'formule' && c.produit.a_formule) return s + c.produit.prix_formule * c.quantite
    return s + c.produit.prix_vente_defaut * c.quantite
  }, 0)
  const cartCount = cart.reduce((s, c) => s + c.quantite, 0)

  const addToCart = (p: Produit) => {
    const existing = cart.find(c => c.produit.uid === p.uid)
    if (existing) {
      setCart(cart.map(c => c.produit.uid === p.uid ? { ...c, quantite: c.quantite + 1 } : c))
    } else {
      setCart([...cart, { produit: p, quantite: 1, mode: 'normal' }])
    }
  }

  const updateQty = (uid: string, delta: number) => {
    setCart(cart.map(c => c.produit.uid === uid ? { ...c, quantite: Math.max(1, c.quantite + delta) } : c).filter(c => c.quantite > 0))
  }

  const removeFromCart = (uid: string) => setCart(cart.filter(c => c.produit.uid !== uid))

  const toggleMode = (uid: string) => {
    setCart(cart.map(c => c.produit.uid === uid ? { ...c, mode: c.mode === 'normal' ? 'formule' : 'normal' } : c))
  }

  const validate = async () => {
    if (!serveur || cart.length === 0) return
    setValidating(true); setMsg('')
    try {
      const r = await api.post<{ success: boolean }>('/ventes/batch', {
        session_uid: crypto.randomUUID(),
        serveur_uid: serveur.uid,
        nom_serveur: serveur.nom,
        lignes: cart.map(c => ({
          ref_produit_uid: c.produit.uid,
          quantite: c.quantite,
          mode_vente: c.mode,
          serveur_uid: serveur.uid,
          nom_serveur: serveur.nom,
        })),
      })
      if (r.success) {
        setCart([]); setShowCart(false); setMsg('✅ Vente enregistrée !')
        const p = await api.post<{ produits: Produit[] }>('/produits/list')
        setProduits(p.produits || [])
        setTimeout(() => setMsg(''), 3000)
      }
    } catch { setMsg('❌ Erreur') }
    finally { setValidating(false) }
  }

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Serveur selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {serveurs.map(s => (
          <button key={s.uid} onClick={() => setServeur(s)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${serveur?.uid === s.uid ? 'bg-brand text-dark' : 'glass text-white/50'}`}>
            {s.nom}
          </button>
        ))}
      </div>

      {/* Tabs Alcool / Soft */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {(['Alcool', 'Soft'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-brand text-dark' : 'text-white/50'}`}>
            {t}
          </button>
        ))}
      </div>

      {msg && <p className="text-center text-sm">{msg}</p>}

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(p => {
          const inCart = cart.find(c => c.produit.uid === p.uid)
          return (
            <button key={p.uid} onClick={() => addToCart(p)}
              className={`glass glass-active rounded-xl p-3 flex flex-col items-center gap-1 relative transition-all ${inCart ? 'border-brand/50' : ''}`}>
              <span className="text-[10px] text-white/30 absolute top-1 right-2">{p.stock_actuel}</span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: p.couleur_icone + '33' }}>
                🍺
              </div>
              <span className="text-[11px] font-medium text-white/80 text-center leading-tight truncate w-full">{p.nom}</span>
              <span className="text-[10px] text-brand">{fmt(p.prix_vente_defaut)}</span>
              {inCart && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand text-dark text-[10px] font-bold flex items-center justify-center">{inCart.quantite}</span>}
            </button>
          )
        })}
      </div>

      {/* Cart FAB */}
      {cart.length > 0 && !showCart && (
        <button onClick={() => setShowCart(true)}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full btn-brand flex items-center justify-center text-xl z-40">
          🛒
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
        </button>
      )}

      {/* Cart Sheet */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowCart(false)}>
          <div className="w-full max-w-md mx-auto glass rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Panier</h3>
              <button onClick={() => setShowCart(false)} className="text-white/40 text-xl">✕</button>
            </div>

            {cart.map(c => (
              <div key={c.produit.uid} className="glass rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{c.produit.nom}</span>
                  <button onClick={() => removeFromCart(c.produit.uid)} className="text-red-400 text-xs">Retirer</button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQty(c.produit.uid, -1)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-lg">−</button>
                  <span className="font-bold text-brand">{c.quantite}</span>
                  <button onClick={() => updateQty(c.produit.uid, 1)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-lg">+</button>
                  {c.produit.a_formule && (
                    <button onClick={() => toggleMode(c.produit.uid)}
                      className={`ml-auto text-[10px] px-3 py-1 rounded-full ${c.mode === 'formule' ? 'bg-brand/20 text-brand' : 'glass text-white/40'}`}>
                      {c.mode === 'formule' ? `Formule (${c.produit.qte_formule})` : 'Normal'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-white/60">Total</span>
              <span className="font-bold text-xl text-brand">{fmt(cartTotal)} F</span>
            </div>

            <button onClick={validate} disabled={validating || !serveur}
              className="w-full btn-brand py-4 text-base">
              {validating ? 'Validation...' : `Valider (${serveur?.nom || 'Aucun serveur'})`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
