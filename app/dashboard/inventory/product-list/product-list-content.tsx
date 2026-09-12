'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiSend } from '@/lib/client-api'
import { formatRupiah } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Product {
  id: number
  code: string
  name: string
  category: string
  categorySlug: string
  category_id: number
  unit: string
  stock: number
  minStock: number
  costPrice: number
  markup: number
  sellingPrice: number
  supplier_id: number | null
  supplierCode: string | null
  supplierName: string | null
  status: string
}

interface Category { id: number; name: string; slug: string }
interface Supplier { id: number; code: string; name: string; company: string | null }

const emptyForm = { name: '', category_id: '', unit: 'Pcs', min_stock: 0, cost_price: 0, markup: 30, supplier_id: '' }

export function ProductListContent() {
  const searchParams = useSearchParams()
  const urlQ = searchParams.get('q') ?? ''
  const [search, setSearch] = useState(urlQ)
  const [q, setQ] = useState(urlQ)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()
  const { show } = useToast()

  // Sinkronkan filter saat datang dari search header (?q=...)
  useEffect(() => {
    setSearch(urlQ)
    setQ(urlQ)
    setPage(1)
  }, [urlQ])

  const params = new URLSearchParams({ search: q, category, status, sort, page: String(page), per_page: '8' })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', q, category, status, sort, page],
    queryFn: () => apiGet<{ success: boolean; data: { products: Product[]; categories: Category[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } } }>(`/api/products?${params}`),
  })
  const { data: supData } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: () => apiGet<{ success: boolean; data: Supplier[] }>(`/api/suppliers?per_page=100`),
    enabled: modalOpen,
  })

  const products = data?.data.products ?? []
  const categories = data?.data.categories ?? []
  const pagination = data?.data.pagination
  const suppliers: Supplier[] = Array.isArray(supData?.data) ? supData.data : []

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name, category_id: String(p.category_id), unit: p.unit,
      min_stock: p.minStock, cost_price: p.costPrice, markup: p.markup,
      supplier_id: p.supplier_id ? String(p.supplier_id) : '',
    })
    setModalOpen(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        category_id: Number(form.category_id),
        unit: form.unit,
        min_stock: Number(form.min_stock),
        cost_price: Number(form.cost_price),
        markup: Number(form.markup),
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      }
      if (editingId) {
        await apiSend(`/api/products?id=${editingId}`, 'PUT', payload)
        show('Barang berhasil diperbarui')
      } else {
        await apiSend('/api/products', 'POST', payload)
        show('Barang berhasil ditambahkan')
      }
      setModalOpen(false)
      qc.invalidateQueries({ queryKey: ['products'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteId) return
    try {
      await apiSend(`/api/products?id=${deleteId}`, 'DELETE')
      show('Barang berhasil dihapus')
      qc.invalidateQueries({ queryKey: ['products'] })
    } catch (err: any) {
      show(err.message || 'Gagal menghapus', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Semua Barang</h1>
        <Button onClick={openAdd}>+ Tambah Barang</Button>
      </div>

      <Card><CardContent className="flex flex-wrap gap-2 p-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1) }}>
          <Input placeholder="Cari kode / nama..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          <Button type="submit" variant="outline">Cari</Button>
        </form>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="">Semua Status</option>
          <option value="aman">Aman</option>
          <option value="rendah">Rendah</option>
          <option value="habis">Habis</option>
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="name">Nama</option>
          <option value="stock-asc">Stok ↑</option>
          <option value="stock-desc">Stok ↓</option>
          <option value="price-asc">Harga ↑</option>
          <option value="price-desc">Harga ↓</option>
        </select>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="space-y-2 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          : isError ? <p className="p-6 text-sm text-destructive">Gagal memuat data.</p>
          : (
            <>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Kode</TableHead><TableHead>Nama</TableHead><TableHead>Kategori</TableHead>
                  <TableHead>Stok</TableHead><TableHead>Harga Jual</TableHead><TableHead>Status</TableHead><TableHead>Aksi</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {products.length === 0 && <TableRow><TableCell className="text-muted-foreground">Tidak ada data.</TableCell></TableRow>}
                  {products.map((p) => (
                    <TableRow key={p.code}>
                      <TableCell className="font-medium">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.stock} {p.unit}</TableCell>
                      <TableCell>{formatRupiah(p.sellingPrice)}</TableCell>
                      <TableCell><Badge variant={p.status === 'habis' ? 'destructive' : p.status === 'rendah' ? 'warning' : 'success'}>{p.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Ubah</Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteId(p.id)}>Hapus</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && <Pagination page={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onChange={setPage} />}
            </>
          )}
      </CardContent></Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editingId ? 'Ubah Barang' : 'Tambah Barang'}>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Kategori</Label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">Pilih...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><Label>Satuan</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Min. Stok</Label><Input type="number" min={0} value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} required /></div>
            <div><Label>Harga Modal</Label><Input type="number" min={0} value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })} required /></div>
            <div><Label>Markup %</Label><Input type="number" min={0} max={100} value={form.markup} onChange={(e) => setForm({ ...form, markup: Number(e.target.value) })} required /></div>
          </div>
          <div><Label>Supplier (opsional)</Label>
            <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              {suppliers.map((s) => <option key={s.code} value={s.id}>{s.company ?? s.name}</option>)}
            </select>
          </div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </form>
      </Modal>

      <Modal open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} title="Hapus Barang">
        <p className="text-sm text-muted-foreground">Yakin hapus barang ini? Tidak bisa dibatalkan.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Batal</Button>
          <Button variant="destructive" onClick={doDelete} className="flex-1">Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
