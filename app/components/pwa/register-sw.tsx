'use client'

import { useEffect } from 'react'

/**
 * Mendaftarkan `/sw.js` — hanya di production agar tidak mengganggu DX.
 * Scope default `/` (SW berada di root) sesuai manifest `scope: '/'`.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    let cancelled = false
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch {
        // Registrasi gagal (mis. preview non-HTTPS) — bukan fatal, abaikan senyap.
      }
    }
    // Daftarkan setelah load agar tidak menunda first paint.
    if (document.readyState === 'complete') {
      if (!cancelled) void register()
    } else {
      const onLoad = () => {
        if (!cancelled) void register()
      }
      window.addEventListener('load', onLoad, { once: true })
      return () => {
        cancelled = true
        window.removeEventListener('load', onLoad)
      }
    }
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
