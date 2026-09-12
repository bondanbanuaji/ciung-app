'use client'

import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { apiGet } from '@/lib/client-api'
import { formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DashboardData {
  stats: {
    totalProducts: number
    totalStock: number
    inventoryValue: number
    stockInToday: number
    stockOutToday: number
    lowStock: number
    outOfStock: number
    totalSuppliers: number
    totalCustomers: number
  }
  lowStockProducts: { code: string; name: string; category: string; stock: number; unit: string; status: string }[]
  recentTransactions: {
    id: string; date: string; type: string; productCode: string; productName: string
    qty: number; total: number; user: string
  }[]
  chartData: { labels: string[]; masuk: number[]; keluar: number[] }
}

type Variant = 'default' | 'destructive' | 'success' | 'warning' | 'info'
const statusVariant = (s: string): Variant => (s === 'habis' ? 'destructive' : s === 'rendah' ? 'warning' : 'success')
const typeVariant = (t: string): Variant => (t === 'masuk' ? 'success' : t === 'keluar' ? 'info' : 'warning')

export function DashboardContent() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<{ success: boolean; data: DashboardData }>('/api/dashboard'),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
        <Card><CardContent className="p-6 text-sm text-destructive">Gagal memuat data. <button className="underline" onClick={() => refetch()}>Coba lagi</button></CardContent></Card>
      </div>
    )
  }

  const { stats, lowStockProducts, recentTransactions, chartData } = data.data
  const chart = chartData.labels.map((label, i) => ({ label, Masuk: chartData.masuk[i], Keluar: chartData.keluar[i] }))

  const cards = [
    { label: 'Total Produk', value: String(stats.totalProducts) },
    { label: 'Total Stok', value: stats.totalStock.toLocaleString('id-ID') },
    { label: 'Nilai Inventory', value: formatRupiah(stats.inventoryValue) },
    { label: 'Stok Rendah', value: String(stats.lowStock) },
    { label: 'Stok Habis', value: String(stats.outOfStock) },
    { label: 'Masuk Hari Ini', value: String(stats.stockInToday) },
    { label: 'Keluar Hari Ini', value: String(stats.stockOutToday) },
    { label: 'Supplier / Customer', value: `${stats.totalSuppliers} / ${stats.totalCustomers}` },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <p className="font-display mt-2 text-2xl font-bold tabular-nums text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Arus Barang 7 Hari Terakhir</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Masuk" fill="#31577D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Keluar" fill="#C51F2A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Stok Rendah</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Nama</TableHead><TableHead>Stok</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {lowStockProducts.length === 0 && <TableRow><TableCell className="text-muted-foreground">Semua stok aman.</TableCell></TableRow>}
                {lowStockProducts.map((p) => (
                    <TableRow key={p.code}>
                      <TableCell className="font-mono text-xs font-medium">{p.code}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.stock} {p.unit}</TableCell>
                    <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Transaksi Terakhir</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Produk</TableHead><TableHead>Tipe</TableHead><TableHead>Qty</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentTransactions.length === 0 && <TableRow><TableCell className="text-muted-foreground">Belum ada transaksi.</TableCell></TableRow>}
                {recentTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell>{t.productName}</TableCell>
                    <TableCell><Badge variant={typeVariant(t.type)}>{t.type}</Badge></TableCell>
                    <TableCell className="tabular-nums">{t.qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
