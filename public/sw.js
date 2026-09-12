/**
 * Service worker minimal Ciung Warna.
 *
 * STRATEGI (disengaja konservatif — aplikasi inventory):
 * - `/api/*`            → network-only, TIDAK PERNAH di-cache.
 *                         Data stok/dashboard/transaksi selalu fresh dari server.
 * - Navigasi (HTML/RSC) → network-only. Tidak ada shell HTML / konten
 *                         sesi user yang disimpan agar tidak ada data basi
 *                         maupun kebocoran sesi antar login.
 * - Aset statis immutable (`/_next/static/*`, `/icons/*`, `/img/*`,
 *   font & gambar) → cache-first + runtime cache, aman karena versioned.
 *
 * SW ini ada untuk memenuhi syarat installability PWA
 * (manifest + icon + SW dengan fetch handler + HTTPS),
 * BUKAN untuk offline-first. Tidak ada dependency baru (tanpa Workbox)
 * agar tidak ada caching agresif yang membuat stok terlihat basi.
 *
 * Naikkan CACHE_VERSION setiap ada perubahan strategi caching.
 */

const CACHE_VERSION = 'ciung-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`

const STATIC_PREFIXES = ['/_next/static/', '/icons/', '/img/']
const STATIC_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf', '.eot']

function isStaticAsset(pathname) {
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))
}

self.addEventListener('install', () => {
  // Aktif langsung tanpa menunggu tab lama ditutup.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }

  // Hanya tangani same-origin. Request cross-origin (API eksternal, dsb) dibiarkan.
  if (url.origin !== self.location.origin) return

  // 1. API & auth: network-only, jangan pernah di-cache.
  if (url.pathname.startsWith('/api/')) return

  // 2. Aset statis: cache-first dengan runtime caching.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        // Hanya simpan response sukses yang bisa di-cache.
        if (response.ok && (response.type === 'basic' || response.type === 'default')) {
          cache.put(request, response.clone())
        }
        return response
      })(),
    )
    return
  }

  // 3. Navigasi & RSC & lainnya: network-only (tidak di-cache).
  //    Tidak ada respondWith → browser menangani seperti biasa.
})
