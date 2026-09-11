import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/store/providers'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

const appUrl =
  process.env.APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Ciung Warna — Inventory Management',
    template: '%s — Ciung Warna',
  },
  description: 'Kelola inventory Ciung Warna',
  icons: {
    icon: [{ url: '/img/ciung__logo.ico', type: 'image/x-icon' }],
    apple: [{ url: '/img/ciung__logo.png', type: 'image/png' }],
  },
  openGraph: {
    title: 'Ciung Warna — Inventory Management',
    description: 'Kelola inventory Ciung Warna',
    images: [{ url: '/img/ciung__logo.png', width: 5000, height: 5000, alt: 'Logo Ciung Warna' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
