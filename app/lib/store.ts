import { db } from '@/lib/db'

export interface StoreBranding {
  name: string
  address: string
  phone: string
  logoPath: string
}

export const STORE_DEFAULTS: StoreBranding = {
  name: 'Ciung Warna',
  address: '',
  phone: '',
  logoPath: '/img/ciung__logo.webp',
}

const KEY_MAP = {
  name: 'store.name',
  address: 'store.address',
  phone: 'store.phone',
  logoPath: 'store.logo_path',
} as const

/** Baca identitas toko dari tabel Setting (grup `store`), fallback ke default bila kosong. */
export async function getStoreBranding(): Promise<StoreBranding> {
  const rows = await db.setting.findMany({ where: { group: 'store' } })
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  return {
    name: byKey[KEY_MAP.name] || STORE_DEFAULTS.name,
    address: byKey[KEY_MAP.address] || '',
    phone: byKey[KEY_MAP.phone] || '',
    logoPath: byKey[KEY_MAP.logoPath] || STORE_DEFAULTS.logoPath,
  }
}

/** Logo yang diizinkan (hanya file logo resmi di public/img). */
export const ALLOWED_LOGOS = ['/img/ciung__logo.webp', '/img/ciung__logo.png'] as const

export async function setStoreBranding(input: Partial<StoreBranding>): Promise<StoreBranding> {
  const entries: [keyof typeof KEY_MAP, string][] = []
  if (input.name !== undefined) entries.push(['name', String(input.name).slice(0, 100)])
  if (input.address !== undefined) entries.push(['address', String(input.address).slice(0, 255)])
  if (input.phone !== undefined) entries.push(['phone', String(input.phone).slice(0, 50)])
  if (input.logoPath !== undefined) {
    const v = String(input.logoPath)
    entries.push(['logoPath', (ALLOWED_LOGOS as readonly string[]).includes(v) ? v : STORE_DEFAULTS.logoPath])
  }
  for (const [field, value] of entries) {
    await db.setting.upsert({
      where: { key: KEY_MAP[field] },
      update: { value, group: 'store' },
      create: { key: KEY_MAP[field], value, group: 'store' },
    })
  }
  return getStoreBranding()
}
