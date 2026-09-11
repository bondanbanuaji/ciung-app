'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiSend } from '@/lib/client-api'
import { formatRupiah } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Priced {
  id: number; code: string; name: string; category: string
  basePrice: number; currentPrice: number; markup: number
}

export function PricingContent() {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Priced | null>(null)
  const [cost, setCost] = useState(0)
  const [markup, setMarkup] = useState(0)
  const [saving, setSaving] = useState(false)
  const [checked, setChecked] = useState<number[]>([])
  const [bulkMarkup, setBulkMarkup] = useState(30)
  const qc = useQueryClient()
  const { show } = useToast()

  const params = new URLSearchParams({ search: q, page: String(page), per_page: '10' })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pricing', q, page],
    queryFn: () => apiGet<{ success: boolean; data: { products: Priced[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } } }>(`/api/pricing?${params}`),
  })
  const rows = data?.data.products ?? []
  const pagination = data?.data.pagination
  const preview = cost * (1 + markup / 100)

  const toggle = (id: number) => setChecked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const openEdit = (p: Priced) => { setEditing(p); setCost(p.basePrice); setMarkup(p.markup) }

  const saveOne = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      await apiSend(`/api/pricing?id=${editing.id}`, 'PUT', { cost_price: cost, markup })
      show('Harga berhasil diperbarui')
      setEditing(null)
      qc.invalidateQueries({ queryKey: ['pricing'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveBulk = async () => {
    if (!checked.length) { show('Pilih minimal satu produk', 'error'); return }
    setSaving(true)
    try {
      await apiSend('/api/pricing', 'POST', { product_ids: checked, markup: bulkMarkup })
      show('Harga bulk berhasil diperbarui')
      setChecked([])
      qc.invalidateQueries({ queryKey: ['pricing'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Harga</h1>
      <Card><CardContent className="flex flex-wrap items-end gap-2 p-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1) }}>
          <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-52" />
          <Button type="submit" variant="outline">Cari</Button>
        </form>
        <div className="flex items-end gap-2">
          <div><Label>Markup bulk %</Label><Input type="number" min={0} max={100} value={bulkMarkup} onChange={(e) => setBulkMarkup(Number(e.target.value))} className="w-24" /></div>
          <Button onClick={saveBulk} disabled={saving || !checked.length}>Terapkan ke {checked.length} produk</Button>
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="space-y-2 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          : isError ? <p className="p-6 text-sm text-destructive">Gagal memuat data.</p>
          : (
            <>
              <Table>
                <TableHeader><TableRow>
                  <TableHead></TableHead><TableHead>Kode</TableHead><TableHead>Nama</TableHead>
                  <TableHead>Modal</TableHead><TableHead>Markup</TableHead><TableHead>Harga Jual</TableHead><TableHead>Aksi</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell><input type="checkbox" checked={checked.includes(p.id)} onChange={() => toggle(p.id)} /></TableCell>
                      <TableCell className="font-medium">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{formatRupiah(p.basePrice)}</TableCell>
                      <TableCell>{p.markup}%</TableCell>
                      <TableCell>{formatRupiah(p.currentPrice)}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => openEdit(p)}>Ubah</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && <Pagination page={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onChange={setPage} />}
            </>
          )}
      </CardContent></Card>

      <Modal open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={`Ubah Harga — ${editing?.code}`}>
        <form onSubmit={saveOne} className="space-y-3">
          <div><Label>Harga Modal</Label><Input type="number" min={0} value={cost} onChange={(e) => setCost(Number(e.target.value))} required /></div>
          <div><Label>Markup %</Label><Input type="number" min={0} max={100} value={markup} onChange={(e) => setMarkup(Number(e.target.value))} required /></div>
          <p className="text-sm text-muted-foreground">Harga jual baru: <span className="font-semibold text-foreground">{formatRupiah(preview)}</span></p>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </form>
      </Modal>
    </div>
  )
}
