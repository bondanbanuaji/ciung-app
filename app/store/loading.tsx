'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

// Counter global: aman untuk aksi bersamaan ( nesting-safe ).
// Dipakai oleh apiSend + login/logout agar setiap aksi menampilkan
// spinner lingkaran di tengah layar.
let count = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function getCount() {
  return count
}

/** Tandai satu aksi berjalan. Panggil fungsi kembaliannya saat aksi selesai. */
export function beginLoading(): () => void {
  count += 1
  emit()
  let done = false
  return () => {
    if (done) return
    done = true
    count = Math.max(0, count - 1)
    emit()
  }
}

/** Overlay spinner tengah layar. Muncul bila ada aksi >250ms (anti-kedip). */
export function GlobalLoadingOverlay() {
  const active = useSyncExternalStore(subscribe, getCount, () => 0) > 0
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    const t = setTimeout(() => setVisible(true), 250)
    return () => clearTimeout(t)
  }, [active])

  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[1px]" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-8 py-6 shadow-[var(--shadow-elevation-3)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Memproses...</p>
      </div>
    </div>
  )
}
