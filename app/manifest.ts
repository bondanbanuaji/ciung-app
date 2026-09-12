import type { MetadataRoute } from 'next'

/**
 * Web App Manifest Ciung Warna.
 * Disajikan otomatis oleh Next.js di `/manifest.webmanifest`.
 * Lihat: app/components/pwa + app/hooks/use-pwa-install.ts untuk install flow.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ciung Warna Inventory',
    short_name: 'Ciung Warna',
    description: 'Sistem inventory dan manajemen stok Ciung Warna.',
    id: '/',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'id',
    dir: 'ltr',
    categories: ['business', 'productivity'],
    theme_color: '#0B1F3A',
    background_color: '#F7F8FA',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Barang Masuk',
        short_name: 'Masuk',
        description: 'Catat stok masuk dari supplier',
        url: '/dashboard/inventory/stock-in',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Barang Keluar',
        short_name: 'Keluar',
        description: 'Catat stok keluar ke customer',
        url: '/dashboard/inventory/stock-out',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Inventory',
        short_name: 'Inventory',
        description: 'Lihat semua barang',
        url: '/dashboard/inventory',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  }
}
