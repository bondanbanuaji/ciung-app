import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MainLayout } from '@/components/layout/main-layout'

export default async function PricingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Atur Harga Jual</h1>
      <div className="rounded-lg bg-card shadow-[var(--shadow-elevation-1)]"><p className="text-muted-foreground p-6">Formulir penetapan harga akan diisi di sini</p></div>
    </div>
  )
}
