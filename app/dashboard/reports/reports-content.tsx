'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/client-api'
import { STORE_LOGO_WEBP } from '@/lib/brand'
import { formatRupiah } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const TABS = [
  { value: 'stok', label: 'Stok' },
  { value: 'masuk', label: 'Masuk' },
  { value: 'keluar', label: 'Keluar' },
  { value: 'penjualan', label: 'Penjualan' },
]

export function ReportsContent() {
  const [tab, setTab] = useState('stok')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ tab, date_from: dateFrom, date_to: dateTo, category_id: categoryId, page: String(page), per_page: '15' })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', tab, dateFrom, dateTo, categoryId, page],
    queryFn: () => apiGet<{ success: boolean; data: { data: any[]; pagination: { current_page: number; last_page: number; per_page: number; total: number }; categories: { id: number; name: string }[] } }>(`/api/reports?${params}`),
  })
  const rows: any[] = data?.data.data ?? []
  const pagination = data?.data.pagination
  const categories = data?.data.categories ?? []
  const exportHref = `/api/reports/export?${new URLSearchParams({ tab, date_from: dateFrom, date_to: dateTo, category_id: categoryId, format: 'csv' })}`
  const { data: brandData } = useQuery({
    queryKey: ['store-branding'],
    queryFn: () => apiGet<{ success: boolean; data: { name: string; address: string; phone: string; logoPath: string } }>('/api/settings/public'),
    staleTime: Infinity,
  })
  const brand = brandData?.data
  const tabLabel = TABS.find((t) => t.value === tab)?.label ?? tab

  return (
    <div className="space-y-4">
      {/* Kop cetak: hanya tampil saat print (lihat CSS print di globals.css) */}
      <div className="report-kop">
        <img src={brand?.logoPath || STORE_LOGO_WEBP} alt="Logo" className="report-kop-logo" />
        <div>
          <p className="report-kop-name">{brand?.name || 'Ciung Warna'}</p>
          {[brand?.address, brand?.phone].filter(Boolean).join(' | ') && (
            <p className="report-kop-sub">{[brand?.address, brand?.phone].filter(Boolean).join(' | ')}</p>
          )}
          <p className="report-kop-sub">Laporan {tabLabel} — {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Laporan</h1>
        <a href={exportHref} className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">Export CSV</a>
      </div>
      <Card><CardContent className="flex flex-wrap items-end gap-2 p-4">
        <div className="flex gap-1 rounded-lg bg-s-muted p-1">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => { setTab(t.value); setPage(1) }} className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === t.value ? 'bg-card shadow' : 'text-muted-foreground'}`}>{t.label}</button>
          ))}
        </div>
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1) }} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div><Label>Dari</Label><Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} /></div>
        <div><Label>Sampai</Label><Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} /></div>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="space-y-2 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          : isError ? <p className="p-6 text-sm text-destructive">Gagal memuat data.</p>
          : tab === 'stok' ? (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Nama</TableHead><TableHead>Kategori</TableHead><TableHead>Stok</TableHead><TableHead>Nilai Stok</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 && <TableRow><TableCell className="text-muted-foreground">Tidak ada data.</TableCell></TableRow>}
                  {rows.map((r: any) => (
                    <TableRow key={r.code}>
                      <TableCell className="font-mono text-xs font-medium">{r.code}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell className="tabular-nums">{r.stock} {r.unit}</TableCell>
                      <TableCell className="tabular-nums">{formatRupiah(r.stockValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && <Pagination page={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onChange={setPage} />}
            </>
          ) : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Produk</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 && <TableRow><TableCell className="text-muted-foreground">Tidak ada data.</TableCell></TableRow>}
                  {rows.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell className="tabular-nums">{r.qty}</TableCell>
                      <TableCell className="tabular-nums">{formatRupiah(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && <Pagination page={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onChange={setPage} />}
            </>
          )}
      </CardContent></Card>
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => window.print()}>Cetak</Button>
      </div>
    </div>
  )
}
