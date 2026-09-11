import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MainLayout } from '@/components/layout/main-layout'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-card p-6 shadow-[var(--shadow-elevation-1)]">
          <p className="text-sm font-medium text-muted-foreground">Total Produk</p>
          <p className="mt-2 text-3xl font-bold text-foreground">0</p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-[var(--shadow-elevation-1)]">
          <p className="text-sm font-medium text-muted-foreground">Total Stok</p>
          <p className="mt-2 text-3xl font-bold text-foreground">0</p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-[var(--shadow-elevation-1)]">
          <p className="text-sm font-medium text-muted-foreground">Nilai Inventory</p>
          <p className="mt-2 text-3xl font-bold text-foreground">Rp 0</p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-[var(--shadow-elevation-1)]">
          <p className="text-sm font-medium text-muted-foreground">Stok Rendah</p>
          <p className="mt-2 text-3xl font-bold text-foreground">0</p>
        </div>
      </div>
    </div>
  )
}
