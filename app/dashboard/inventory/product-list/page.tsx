import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MainLayout } from '@/components/layout/main-layout'

export default async function InventoryPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Semua Barang</h1>
      <div className="rounded-lg bg-card shadow-[var(--shadow-elevation-1)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-s-muted">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Kode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stok</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga Jual</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-s-muted">
            <tr className="hover:bg-s-muted/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium">CW-001</td>
              <td className="px-4 py-3 text-sm">Cat Tembok Dulux Catylac Putih 25kg</td>
              <td className="px-4 py-3 text-sm">Cat Tembok</td>
              <td className="px-4 py-3 text-sm">48</td>
              <td className="px-4 py-3 text-sm">Rp 630.500</td>
              <td className="px-4 py-3"><span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">Aman</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
