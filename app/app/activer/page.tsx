'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { activerParCapture, checkAccess } from '@/lib/api'

export default function ActiverPage() {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setMsg('Image trop lourde (max 5 Mo)'); return }
    setImage(f)
    setPreview(URL.createObjectURL(f))
    setMsg('')
  }

  async function handleSubmit() {
    const s = getSession()
    if (!s || !image) return
    setLoading(true); setMsg('')
    try {
      const r = await activerParCapture(s.uid, s.telephone, image)
      if (r.success) {
        setSent(true)
        startPolling()
      } else { setMsg(r.message || 'Erreur') }
    } catch { setMsg('Erreur réseau') }
    finally { setLoading(false) }
  }

  function startPolling() {
    const s = getSession()
    if (!s) return
    pollRef.current = setInterval(async () => {
      try {
        const r = await checkAccess(s.uid)
        if (r.access_granted) {
          if (pollRef.current) clearInterval(pollRef.current)
          router.replace('/app?activated=1')
        }
      } catch {}
    }, 5000)
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 glass flex items-center justify-center mb-6">
        <span className="text-3xl">🔒</span>
      </div>

      <h1 className="text-xl font-bold mb-2 text-center">Activer votre licence</h1>
      <p className="text-white/40 text-sm text-center mb-6">
        Envoyez <span className="text-brand font-bold">15 000 FCFA</span> par Wave au{' '}
        <span className="text-white font-semibold">05 08 06 34 37</span>
      </p>

      {!sent ? (
        <div className="w-full space-y-4">
          <label className="glass rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {preview ? (
              <img src={preview} alt="Capture" className="w-full rounded-xl max-h-64 object-contain" />
            ) : (
              <>
                <span className="text-4xl">📷</span>
                <span className="text-white/40 text-sm">Prendre ou choisir la capture de paiement</span>
              </>
            )}
          </label>

          {msg && <p className="text-red-400 text-sm text-center">{msg}</p>}

          <button onClick={handleSubmit} disabled={!image || loading}
            className="w-full btn-brand py-4 text-base disabled:opacity-30">
            {loading ? 'Envoi en cours...' : 'Envoyer la capture'}
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 w-full text-center space-y-3">
          <span className="text-4xl">✅</span>
          <p className="text-brand font-semibold">Capture envoyée !</p>
          <p className="text-white/40 text-sm">
            Votre compte sera activé sous peu. Veuillez patienter...
          </p>
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>
      )}
    </div>
  )
}
