'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace(getSession() ? '/app' : '/login')
  }, [router])
  return null
}
