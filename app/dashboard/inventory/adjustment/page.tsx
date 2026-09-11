import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MainLayout } from '@/components/layout/main-layout'

export default async function AdjustmentPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Adjustment Stok</h1>
      <div className="rounded-lg bg-card p-6 shadow-[var(--shadow-elevation-1)]">
        <p className="text-muted-foreground">Formulir adjustment akan diisi di sini</p>
      </div>
    </div>
  )
}
