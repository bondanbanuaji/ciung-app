'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/client-api'
import { formatDate, formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Txn {
  id: string; date: string; type: string; productCode: string; productName: string
  category: string; qty: number; unitPrice: number; total: number; user: string
}

export function TransactionsContent() {
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ type, search: q, date_from: dateFrom, date_to: dateTo, page: String(page), per_page: '15' })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['transactions', type, q, dateFrom, dateTo, page],
    queryFn: () => apiGet<{ success: boolean; data: { transactions: Txn[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } } }>(`/api/transactions?${params}`),
  })
  const rows = data?.data.transactions ?? []
  const pagination = data?.data.pagination

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Riwayat Transaksi</h1>
      <Card><CardContent className="flex flex-wrap items-end gap-2 p-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1) }}>
          <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-52" />
          <Button type="submit" variant="outline">Cari</Button>
        </form>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="">Semua Tipe</option>
          <option value="masuk">Masuk</option>
          <option value="keluar">Keluar</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <div><Label>Dari</Label><Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} /></div>
        <div><Label>Sampai</Label><Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} /></div>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="space-y-2 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          : isError ? <p className="p-6 text-sm text-destructive">Gagal memuat data.</p>
          : (
            <>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>ID</TableHead><TableHead>Tanggal</TableHead><TableHead>Produk</TableHead>
                  <TableHead>Tipe</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead><TableHead>User</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 && <TableRow><TableCell className="text-muted-foreground">Tidak ada data.</TableCell></TableRow>}
                  {rows.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell>{formatDate(t.date)}</TableCell>
                      <TableCell>{t.productName}</TableCell>
                      <TableCell><Badge variant={t.type === 'masuk' ? 'success' : t.type === 'keluar' ? 'info' : 'warning'}>{t.type}</Badge></TableCell>
                      <TableCell className="tabular-nums">{t.qty}</TableCell>
                      <TableCell className="tabular-nums">{formatRupiah(t.total)}</TableCell>
                      <TableCell>{t.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && <Pagination page={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onChange={setPage} />}
            </>
          )}
      </CardContent></Card>
    </div>
  )
}
