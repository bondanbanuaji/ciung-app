'use client'

import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/client-api'
import { STORE_LOGO_WEBP } from '@/lib/brand'

interface Branding {
  name: string
  address: string
  phone: string
  logoPath: string
}

/** Logo + nama toko, diambil dari identitas toko di database (fallback logo webp). */
export function StoreLogo({ size = 64, showName = true }: { size?: number; showName?: boolean }) {
  const { data } = useQuery({
    queryKey: ['store-branding'],
    queryFn: () => apiGet<{ success: boolean; data: Branding }>('/api/settings/public'),
    staleTime: Infinity,
  })
  const branding = data?.data
  const src = branding?.logoPath || STORE_LOGO_WEBP
  const name = branding?.name || 'Ciung Warna'

  return (
    <span className="inline-flex flex-col items-center gap-3">
      <Image
        src={src}
        alt={`Logo ${name}`}
        width={size}
        height={size}
        className="rounded-2xl object-contain"
        priority
      />
      {showName && <span className="font-display text-2xl font-bold text-foreground">{name}</span>}
    </span>
  )
}

/** Logo kecil untuk header sidebar (logo + nama + sublabel). */
export function StoreMark({ size = 32 }: { size?: number }) {
  const { data } = useQuery({
    queryKey: ['store-branding'],
    queryFn: () => apiGet<{ success: boolean; data: Branding }>('/api/settings/public'),
    staleTime: Infinity,
  })
  const branding = data?.data
  const src = branding?.logoPath || STORE_LOGO_WEBP
  const name = branding?.name || 'Ciung Warna'

  return (
    <span className="flex items-center gap-3 min-w-0">
      <Image
        src={src}
        alt={`Logo ${name}`}
        width={size}
        height={size}
        className="rounded-lg object-contain shrink-0"
        priority
      />
      <span className="min-w-0">
        <span className="font-display block font-bold text-sidebar-foreground leading-none text-[14px] truncate">{name}</span>
        <span className="block text-[11px] tracking-widest font-medium text-muted-foreground uppercase mt-0.5">Inventory</span>
      </span>
    </span>
  )
}
