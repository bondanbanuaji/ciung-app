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

interface Partner {
  id: number; code: string; name: string; company?: string | null
  phone: string | null; email: string | null; address: string | null; notes: string | null
  totalTransactions: number; totalPurchase: number; joinedAt: string
}

const empty = { name: '', company: '', phone: '', email: '', address: '', notes: '' }

export function PartnerContent({ kind, title, single }: { kind: 'suppliers' | 'customers'; title: string; single: string }) {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()
  const { show } = useToast()
  const hasCompany = kind === 'suppliers'

  const params = new URLSearchParams({ search: q, page: String(page), per_page: '10' })
  const { data, isLoading, isError } = useQuery({
    queryKey: [kind, q, page],
    queryFn: () => apiGet<{ success: boolean; data: Partner[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } }>(`/api/${kind}?${params}`),
  })
  const rows = data?.data ?? []
  const pagination = data?.pagination

  const openAdd = () => { setEditing(null); setForm(empty); setModalOpen(true) }
  const openEdit = (p: Partner) => {
    setEditing(p)
    setForm({ name: p.name, company: p.company ?? '', phone: p.phone ?? '', email: p.email ?? '', address: p.address ?? '', notes: p.notes ?? '' })
    setModalOpen(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        ...(hasCompany ? { company: form.company || undefined } : {}),
        phone: form.phone || undefined, email: form.email || undefined,
        address: form.address || undefined, notes: form.notes || undefined,
      }
      if (editing) {
        await apiSend(`/api/${kind}?id=${editing.id}`, 'PUT', payload)
        show(`${single} berhasil diperbarui`)
      } else {
        await apiSend(`/api/${kind}`, 'POST', payload)
        show(`${single} berhasil ditambahkan`)
      }
      setModalOpen(false)
      qc.invalidateQueries({ queryKey: [kind] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteId) return
    try {
      await apiSend(`/api/${kind}?id=${deleteId}`, 'DELETE')
      show(`${single} berhasil dihapus`)
      qc.invalidateQueries({ queryKey: [kind] })
    } catch (err: any) {
      show(err.message || 'Gagal menghapus', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <Button onClick={openAdd}>+ Tambah {single}</Button>
      </div>
      <Card><CardContent className="p-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1) }}>
          <Input placeholder={`Cari ${single.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button type="submit" variant="outline">Cari</Button>
        </form>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="space-y-2 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          : isError ? <p className="p-6 text-sm text-destructive">Gagal memuat data.</p>
          : (
            <>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Kode</TableHead><TableHead>Nama</TableHead>
                  {hasCompany && <TableHead>Perusahaan</TableHead>}
                  <TableHead>Telepon</TableHead><TableHead>Transaksi</TableHead><TableHead>Total</TableHead><TableHead>Aksi</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rows.length === 0 && <TableRow><TableCell className="text-muted-foreground">Tidak ada data.</TableCell></TableRow>}
                  {rows.map((p) => (
                    <TableRow key={p.code}>
                      <TableCell className="font-medium">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      {hasCompany && <TableCell>{p.company ?? '-'}</TableCell>}
                      <TableCell>{p.phone ?? '-'}</TableCell>
                      <TableCell>{p.totalTransactions}</TableCell>
                      <TableCell>{formatRupiah(p.totalPurchase)}</TableCell>
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

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? `Ubah ${single}` : `Tambah ${single}`}>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          {hasCompany && <div><Label>Perusahaan</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telepon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div><Label>Alamat</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Catatan</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </form>
      </Modal>

      <Modal open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} title={`Hapus ${single}`}>
        <p className="text-sm text-muted-foreground">Yakin hapus data ini?</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Batal</Button>
          <Button variant="destructive" onClick={doDelete} className="flex-1">Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
