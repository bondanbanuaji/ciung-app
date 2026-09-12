import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ciung Warna — Inventory Management',
    short_name: 'Ciung Warna',
    description: 'Kelola inventory Ciung Warna',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0B1F3A',
    icons: [
      { src: '/img/ciung__logo.png', sizes: '5000x5000', type: 'image/png', purpose: 'any' },
      { src: '/img/ciung__logo.webp', sizes: 'any', type: 'image/webp', purpose: 'any' },
    ],
  }
}
