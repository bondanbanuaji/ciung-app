import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/user'

export async function authOr401() {
  const user = await requireUser()
  if (!user) {
    return {
      user: null as null,
      error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { user, error: null as null }
}

export function paging(url: URL, defaultPerPage = 15) {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || defaultPerPage))
  return { page, perPage, skip: (page - 1) * perPage }
}

export function paginationMeta(page: number, perPage: number, total: number) {
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  return {
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to: Math.min(page * perPage, total),
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function stockStatus(stock: number, minStock: number): 'habis' | 'rendah' | 'aman' {
  if (stock === 0) return 'habis'
  if (stock <= minStock) return 'rendah'
  return 'aman'
}

export function formattedMovementId(movementDate: Date, id: number): string {
  const d = new Date(movementDate)
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  return `TRX-${ymd}-${String(id).padStart(3, '0')}`
}

/** Awal hari (UTC) untuk kolom movementDate bertipe Date. */
export function todayUTC(): Date {
  const n = new Date()
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()))
}

export function dayBounds(dateStr: string): { gte: Date; lt: Date } {
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00Z` : dateStr)
  const gte = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const lt = new Date(gte)
  lt.setUTCDate(lt.getUTCDate() + 1)
  return { gte, lt }
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export const num = (v: unknown): number => Number(v as number)
