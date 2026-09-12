import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/store/providers'

/* Ciung Warna type system:
   - display → Space Grotesk (brand / headings / KPI)
   - sans (body) → Inter (UI / form / table / nav)
   - mono → IBM Plex Mono (SKU / transaction ID / technical ref) */
const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--type-display', display: 'swap' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--type-body', display: 'swap' })
const pmono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--type-pmono', display: 'swap' })

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
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
      <body className={`${display.variable} ${body.variable} ${pmono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
