import { useState, useEffect } from 'react'
import { api, Depense } from '../api'

const CATEGORIES = ['Achat boissons', 'Salaires', 'Loyer', 'Transport', 'Électricité', 'Divers']

export default function Depenses() {
  const [depenses, setDepenses] = useState<Depense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [cat, setCat] = useState(CATEGORIES[0])
  const [desc, setDesc] = useState('')
  const [montant, setMontant] = useState('')
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const [dateDebut, setDateDebut] = useState(today)
  const [dateFin, setDateFin] = useState(today)

  const load = async () => {
    setLoading(true)
    const r = await api.post<{ depenses: Depense[] }>('/depenses/list', { date_debut: dateDebut, date_fin: dateFin })
    setDepenses(r.depenses || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [dateDebut, dateFin])

  const total = depenses.reduce((s, d) => s + d.montant, 0)
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  const save = async () => {
    if (!montant) return
    setSaving(true)
    await api.post('/depenses/create', { uid: crypto.randomUUID(), categorie: cat, description: desc, montant: +montant, date_depense: today })
    setSaving(false); setShowForm(false); setDesc(''); setMontant(''); load()
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex gap-2">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="flex-1 !py-2 !text-sm" />
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="flex-1 !py-2 !text-sm" />
      </div>

      <div className="glass rounded-xl p-4 flex justify-between items-center">
        <span className="text-white/60 text-sm">Total dépenses</span>
        <span className="text-red-400 font-bold text-lg">{fmt(total)} F</span>
      </div>

      <button onClick={() => setShowForm(true)} className="w-full btn-brand py-3 text-sm">+ Nouvelle dépense</button>

      {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>
      : depenses.length === 0 ? <p className="text-center text-white/30 py-10">Aucune dépense</p>
      : depenses.map(d => (
        <div key={d.uid} className="glass rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div><span className="text-sm font-medium">{d.categorie}</span>{d.description && <p className="text-white/40 text-xs mt-0.5">{d.description}</p>}</div>
            <span className="text-red-400 font-bold text-sm">{fmt(d.montant)} F</span>
          </div>
          <p className="text-white/20 text-[10px] mt-1">{d.date_depense}</p>
        </div>
      ))}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md mx-auto glass rounded-t-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold">Nouvelle dépense</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${cat === c ? 'bg-brand text-dark' : 'glass text-white/50'}`}>{c}</button>
              ))}
            </div>
            <input placeholder="Description (optionnel)" value={desc} onChange={e => setDesc(e.target.value)} />
            <input placeholder="Montant (FCFA) *" type="number" value={montant} onChange={e => setMontant(e.target.value)} inputMode="numeric" />
            <button onClick={save} disabled={saving || !montant} className="w-full btn-brand py-3.5">{saving ? '...' : 'Enregistrer'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
