import { useState, useEffect } from 'react'
import { api, Produit } from '../api'

export default function Stock() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Produit | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const r = await api.post<{ produits: Produit[] }>('/produits/list')
    setProduits(r.produits || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = produits.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()))
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex gap-2">
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 !py-2.5 !text-sm" />
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-brand px-4 py-2.5 text-sm shrink-0">+ Produit</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-white/30 py-10">Aucun produit</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const alert = p.stock_actuel <= p.seuil_alerte
            return (
              <div key={p.uid} onClick={() => { setEditing(p); setShowForm(true) }}
                className="glass glass-active rounded-xl p-4 flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.couleur_icone + '33' }}>🍺</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{p.nom}</span>
                    <span className="text-[10px] text-white/30">{p.categorie_boisson}</span>
                  </div>
                  <div className="flex gap-3 text-[11px] text-white/50 mt-0.5">
                    <span>Vente: {fmt(p.prix_vente_defaut)} F</span>
                    <span>Achat: {fmt(p.prix_achat)} F</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-lg font-bold ${alert ? 'text-red-400' : 'text-brand'}`}>{p.stock_actuel}</span>
                  <p className="text-[10px] text-white/30">{p.unite}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <ProduitForm produit={editing} onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  )
}

function ProduitForm({ produit, onClose, onSaved }: { produit: Produit | null; onClose: () => void; onSaved: () => void }) {
  const [nom, setNom] = useState(produit?.nom || '')
  const [pv, setPv] = useState(String(produit?.prix_vente_defaut || ''))
  const [pa, setPa] = useState(String(produit?.prix_achat || ''))
  const [stock, setStock] = useState(String(produit?.stock_actuel || '0'))
  const [seuil, setSeuil] = useState(String(produit?.seuil_alerte || '5'))
  const [unite, setUnite] = useState(produit?.unite || 'Bouteille(s)')
  const [cat, setCat] = useState(produit?.categorie_boisson || 'Alcool')
  const [formule, setFormule] = useState(produit?.a_formule || false)
  const [qteF, setQteF] = useState(String(produit?.qte_formule || ''))
  const [pxF, setPxF] = useState(String(produit?.prix_formule || ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!nom || !pv || !pa) { setError('Nom, prix vente et prix achat requis'); return }
    setSaving(true); setError('')
    try {
      if (produit) {
        await api.put('/produits/update', {
          uid: produit.uid, nom, prix_vente_defaut: +pv, prix_achat: +pa, stock_actuel: +stock,
          seuil_alerte: +seuil, unite, categorie_boisson: cat, a_formule: formule,
          qte_formule: +qteF || 0, prix_formule: +pxF || 0,
        })
      } else {
        await api.post('/produits/create', {
          nom, prix_vente_defaut: +pv, prix_achat: +pa, stock_actuel: +stock,
          seuil_alerte: +seuil, unite, categorie_boisson: cat, a_formule: formule,
          qte_formule: +qteF || 0, prix_formule: +pxF || 0,
        })
      }
      onSaved(); onClose()
    } catch { setError('Erreur') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!produit || !confirm('Supprimer ce produit ?')) return
    await api.del('/produits/delete', { uid: produit.uid })
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={onClose}>
      <div className="w-full max-w-md mx-auto glass rounded-t-3xl p-5 space-y-3 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold">{produit ? 'Modifier' : 'Nouveau produit'}</h3>
          <button onClick={onClose} className="text-white/40 text-xl">✕</button>
        </div>
        <input placeholder="Nom du produit *" value={nom} onChange={e => setNom(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Prix vente *" type="number" value={pv} onChange={e => setPv(e.target.value)} />
          <input placeholder="Prix achat *" type="number" value={pa} onChange={e => setPa(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Stock initial" type="number" value={stock} onChange={e => setStock(e.target.value)} />
          <input placeholder="Seuil alerte" type="number" value={seuil} onChange={e => setSeuil(e.target.value)} />
        </div>

        <div className="flex gap-2">
          {['Alcool', 'Soft'].map(c => (
            <button key={c} onClick={() => setCat(c)} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${cat === c ? 'bg-brand text-dark' : 'glass text-white/50'}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {['Bouteille(s)', 'Canette', 'Tournée'].map(u => (
            <button key={u} onClick={() => setUnite(u)} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${unite === u ? 'bg-brand text-dark' : 'glass text-white/50'}`}>{u}</button>
          ))}
        </div>

        <label className="flex items-center gap-3 glass rounded-xl px-4 py-3 cursor-pointer">
          <input type="checkbox" checked={formule} onChange={e => setFormule(e.target.checked)} className="w-5 h-5 accent-brand" />
          <span className="text-sm">Vente en formule</span>
        </label>
        {formule && (
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Qté par formule" type="number" value={qteF} onChange={e => setQteF(e.target.value)} />
            <input placeholder="Prix formule" type="number" value={pxF} onChange={e => setPxF(e.target.value)} />
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button onClick={save} disabled={saving} className="w-full btn-brand py-3.5">{saving ? '...' : produit ? 'Enregistrer' : 'Créer le produit'}</button>
        {produit && <button onClick={handleDelete} className="w-full text-red-400 text-xs py-2">Supprimer ce produit</button>}
      </div>
    </div>
  )
}
