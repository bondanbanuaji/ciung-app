'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Typing minimal untuk browser install prompt.
 * `BeforeInstallPromptEvent` belum ada di semua versi TS DOM lib,
 * jadi didefinisikan lokal dan terisolasi (tanpa `any`).
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export type PwaPlatform = 'ios' | 'android' | 'desktop' | 'unknown'

function detectPlatform(): PwaPlatform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent || ''
  const isIOSDevice = /iphone|ipad|ipod/i.test(ua)
  // iPadOS 13+ melaporkan diri sebagai Macintosh + touch.
  const isIPadOS =
    /macintosh/i.test(ua) &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1
  if (isIOSDevice || isIPadOS) return 'ios'
  if (/android/i.test(ua)) return 'android'
  if (/windows|macintosh|linux|cros/i.test(ua)) return 'desktop'
  return 'unknown'
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const standaloneQuery = window.matchMedia('(display-mode: standalone)')
  const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)')
  const iosStandalone =
    typeof navigator !== 'undefined' &&
    'standalone' in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return standaloneQuery.matches || fullscreenQuery.matches || iosStandalone
}

export interface PwaInstallState {
  /** True jika browser menyediakan prompt install native & app belum terinstall. */
  canInstall: boolean
  /** True jika app berjalan sebagai installed PWA (standalone). */
  isInstalled: boolean
  /** Platform hasil deteksi aman (untuk fallback instruksi iOS). */
  platform: PwaPlatform
  /** True jika user iOS & belum installed (Safari tak mendukung beforeinstallprompt). */
  showIOSHint: boolean
  /** True saat native prompt sedang ditampilkan. */
  isPrompting: boolean
  /** Panggil dari handler klik user — memicu browser native install prompt. */
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

/**
 * Hook reusable untuk PWA install flow:
 * simpan `beforeinstallprompt` → tampilkan CTA → `prompt()` saat user klik
 * → reset setelah accept/dismiss → sembunyikan CTA setelah `appinstalled`.
 * Aman di browser tanpa dukungan API (CTA cukup disembunyikan).
 */
export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandaloneDisplay())
  const [platform] = useState<PwaPlatform>(() => detectPlatform())
  const [isPrompting, setIsPrompting] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      // Cegah mini-infobar otomatis; kita tampilkan CTA sendiri di header.
      e.preventDefault()
      if (!isStandaloneDisplay()) {
        setDeferredPrompt(e as BeforeInstallPromptEvent)
      }
    }
    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
    const mq = window.matchMedia('(display-mode: standalone)')
    const onDisplayModeChange = (ev: MediaQueryListEvent) => {
      if (ev.matches) {
        setDeferredPrompt(null)
        setIsInstalled(true)
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onDisplayModeChange)
    }

    // Sinkronisasi awal (mis. dibuka dari home screen tanpa event).
    if (isStandaloneDisplay()) {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', onDisplayModeChange)
      }
    }
  }, [])

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'
    setIsPrompting(true)
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      return choice.outcome
    } catch {
      return 'dismissed'
    } finally {
      // Prompt hanya bisa dipakai sekali — selalu reset setelah dipakai.
      setDeferredPrompt(null)
      setIsPrompting(false)
    }
  }, [deferredPrompt])

  const canInstall = deferredPrompt !== null && !isInstalled
  const showIOSHint = platform === 'ios' && !isInstalled && deferredPrompt === null

  return { canInstall, isInstalled, platform, showIOSHint, isPrompting, install }
}
