'use client'

import { useState } from 'react'
import { MonitorDown, Share, X } from 'lucide-react'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { cn } from '@/lib/utils'

/**
 * Tombol "Install App" PWA untuk header/topbar.
 *
 * - Chromium (desktop/Android): muncul hanya jika browser menyediakan
 *   `beforeinstallprompt`; klik memicu NATIVE install prompt (bukan toast palsu).
 * - iOS/Safari: tidak ada prompt API → tombol membuka hint kecil non-modal
 *   "Bagikan → Tambahkan ke Layar Utama".
 * - Browser lain tanpa dukungan / sudah terinstall → render null
 *   (tidak ada tombol mati, tidak ada penawaran berulang).
 *
 * Satu elemen <button> responsif: icon-only di layar sempit,
 * icon + label di layar ≥sm. Jangan render ganda.
 */
export function InstallAppButton({ className }: { className?: string }) {
  const { canInstall, isInstalled, showIOSHint, isPrompting, install } = usePwaInstall()
  const [hintOpen, setHintOpen] = useState(false)

  // Sudah berjalan sebagai installed PWA → jangan tawarkan lagi.
  if (isInstalled) return null

  // iOS: instruksi manual yang aman (tanpa fake install).
  if (!canInstall && showIOSHint) {
    return (
      <div className={cn('relative shrink-0', className)}>
        <button
          type="button"
          onClick={() => setHintOpen((v) => !v)}
          aria-label="Cara memasang aplikasi"
          aria-expanded={hintOpen}
          title="Pasang aplikasi"
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[13px] font-medium text-foreground shadow-[var(--shadow-border)] transition-colors hover:bg-s-muted sm:px-3"
        >
          <MonitorDown size={16} className="shrink-0 text-muted-foreground" />
          <span className="hidden md:inline">Install App</span>
        </button>
        {hintOpen && (
          <>
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setHintOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-elevation-3)]">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Pasang Ciung Warna</p>
                <button
                  type="button"
                  onClick={() => setHintOpen(false)}
                  aria-label="Tutup petunjuk"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-s-muted"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                <Share size={13} className="mt-0.5 shrink-0" />
                <span>
                  Ketuk <span className="font-medium text-foreground">Bagikan</span> di Safari,
                  lalu pilih{' '}
                  <span className="font-medium text-foreground">Tambahkan ke Layar Utama</span>.
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    )
  }

  // Browser mendukung prompt tapi belum menyediakannya (belum installable),
  // atau browser tanpa dukungan sama sekali → sembunyikan, jangan tombol mati.
  if (!canInstall) return null

  return (
    <button
      type="button"
      onClick={() => void install()}
      disabled={isPrompting}
      aria-label="Install aplikasi Ciung Warna"
      title="Install aplikasi Ciung Warna"
      className={cn(
        'flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[13px] font-medium text-foreground shadow-[var(--shadow-border)] transition-colors hover:bg-s-muted disabled:opacity-60 sm:px-3',
        className,
      )}
    >
      <MonitorDown size={16} className="shrink-0 text-muted-foreground" />
      <span className="hidden md:inline">{isPrompting ? 'Membuka...' : 'Install App'}</span>
    </button>
  )
}
