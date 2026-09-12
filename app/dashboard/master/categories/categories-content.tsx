'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiSend } from '@/lib/client-api'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Category { id: number; name: string; slug: string; icon: string | null; color: string | null; products_count: number }

export function CategoriesContent() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()
  const { show } = useToast()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<{ success: boolean; data: Category[] }>('/api/categories'),
  })
  const categories = data?.data ?? []

  const openAdd = () => { setEditing(null); setName(''); setIcon(''); setColor(''); setModalOpen(true) }
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setIcon(c.icon ?? ''); setColor(c.color ?? ''); setModalOpen(true) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name, icon: icon || undefined, color: color || undefined }
      if (editing) {
        await apiSend(`/api/categories?id=${editing.id}`, 'PUT', payload)
        show('Kategori berhasil diperbarui')
      } else {
        await apiSend('/api/categories', 'POST', payload)
        show('Kategori berhasil ditambahkan')
      }
      setModalOpen(false)
      qc.invalidateQueries({ queryKey: ['categories'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteId) return
    try {
      await apiSend(`/api/categories?id=${deleteId}`, 'DELETE')
      show('Kategori berhasil dihapus')
      qc.invalidateQueries({ queryKey: ['categories'] })
    } catch (err: any) {
      show(err.message || 'Gagal menghapus', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Kategori</h1>
        <Button onClick={openAdd}>+ Tambah Kategori</Button>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="space-y-2 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          : isError ? <p className="p-6 text-sm text-destructive">Gagal memuat data.</p>
          : (
            <Table>
              <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Slug</TableHead><TableHead>Jumlah Barang</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs">{c.slug}</TableCell>
                    <TableCell><Badge>{c.products_count}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Ubah</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteId(c.id)}>Hapus</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </CardContent></Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Ubah Kategori' : 'Tambah Kategori'}>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Nama</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Icon (opsional)</Label><Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Palette" /></div>
            <div><Label>Warna (opsional)</Label><Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#E7E9EC" /></div>
          </div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </form>
      </Modal>

      <Modal open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} title="Hapus Kategori">
        <p className="text-sm text-muted-foreground">Yakin hapus kategori ini?</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Batal</Button>
          <Button variant="destructive" onClick={doDelete} className="flex-1">Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
