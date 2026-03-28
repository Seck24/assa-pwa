import { useState, useEffect } from 'react'
import { api, Vente, Depense } from '../api'

export default function Rapport() {
  const today = new Date().toISOString().slice(0, 10)
  const [dateDebut, setDateDebut] = useState(today)
  const [dateFin, setDateFin] = useState(today)
  const [data, setData] = useState<{ total_marge: number; total_depenses: number; benefice_net: number; ventes: Vente[]; depenses: Depense[] } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await api.post<any>('/rapport', { date_debut: dateDebut, date_fin: dateFin })
    const ca = (r.ventes || []).reduce((s: number, v: Vente) => s + v.sous_total, 0)
    setData({ ...r, chiffre_affaires: ca })
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1"><label className="text-[10px] text-white/40">Du</label><input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="!py-2 !text-sm" /></div>
        <div className="flex-1"><label className="text-[10px] text-white/40">Au</label><input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="!py-2 !text-sm" /></div>
        <button onClick={load} className="btn-brand px-4 py-2.5 text-sm shrink-0">OK</button>
      </div>

      {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>
      : data && <>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Bénéfice net</p>
          <p className={`text-3xl font-bold ${data.benefice_net >= 0 ? 'text-brand' : 'text-red-400'}`}>{fmt(data.benefice_net)} F</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-4"><p className="text-[10px] text-white/40">CA</p><p className="text-lg font-bold text-brand">{fmt((data as any).chiffre_affaires || 0)} F</p></div>
          <div className="glass rounded-xl p-4"><p className="text-[10px] text-white/40">Marge brute</p><p className="text-lg font-bold text-emerald-400">{fmt(data.total_marge)} F</p></div>
        </div>
        <div className="glass rounded-xl p-4"><p className="text-[10px] text-white/40">Dépenses</p><p className="text-lg font-bold text-red-400">{fmt(data.total_depenses)} F</p></div>

        {data.ventes.length > 0 && <>
          <h3 className="text-sm font-semibold text-white/60 pt-2">Détail ventes</h3>
          {data.ventes.sort((a, b) => b.quantite - a.quantite).map((v, i) => (
            <div key={i} className="glass rounded-xl p-3 flex justify-between items-center">
              <div><span className="text-sm font-medium">{v.nom_affiche}</span><span className="text-white/30 text-xs ml-2">x{v.quantite}</span></div>
              <div className="text-right"><p className="text-brand text-sm font-bold">{fmt(v.sous_total)} F</p><p className="text-[10px] text-emerald-400">marge {fmt(v.marge)} F</p></div>
            </div>
          ))}
        </>}
      </>}
    </div>
  )
}
