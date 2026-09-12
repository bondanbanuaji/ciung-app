import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-display text-9xl font-bold tabular-nums text-primary">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">Halaman tidak ditemukan</p>
        <a href="/dashboard" className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elevation-1)] hover:shadow-[var(--shadow-elevation-2)] transition-shadow">Kembali ke Dashboard</a>
      </div>
    </div>
  )
}
