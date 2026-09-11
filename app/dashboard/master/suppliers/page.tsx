import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MainLayout } from '@/components/layout/main-layout'

export default async function SuppliersPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Supplier</h1>
      <div className="rounded-lg bg-card shadow-[var(--shadow-elevation-1)]"><p className="text-muted-foreground p-6">Data supplier akan ditampilkan di sini</p></div>
    </div>
  )
}
