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
import type { User } from '@/types'

const empty = { name: '', username: '', email: '', password: '', confirm: '', role: 'kasir' }

export function UsersContent() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState('active')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()
  const { show } = useToast()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiGet<{ success: boolean; data: User[] }>('/api/users'),
  })
  const users = data?.data ?? []

  const openAdd = () => { setEditing(null); setForm(empty); setStatus('active'); setModalOpen(true) }
  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ name: u.name, username: u.username, email: u.email, password: '', confirm: '', role: u.role ?? 'kasir' })
    setStatus(u.status ?? 'active')
    setModalOpen(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing && form.password !== form.confirm) { show('Konfirmasi password tidak cocok', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        await apiSend(`/api/users?id=${editing.id}`, 'PUT', { name: form.name, email: form.email, role: form.role, status })
        show('User berhasil diperbarui')
      } else {
        await apiSend('/api/users', 'POST', { name: form.name, username: form.username, email: form.email, password: form.password, password_confirmation: form.confirm, role: form.role })
        show('User berhasil ditambahkan')
      }
      setModalOpen(false)
      qc.invalidateQueries({ queryKey: ['users'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteId) return
    try {
      await apiSend(`/api/users?id=${deleteId}`, 'DELETE')
      show('User berhasil dihapus')
      qc.invalidateQueries({ queryKey: ['users'] })
    } catch (err: any) {
      show(err.message || 'Gagal menghapus', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">User & Akses</h1>
        <Button onClick={openAdd}>+ Tambah User</Button>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="space-y-2 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          : isError ? <p className="p-6 text-sm text-destructive">Gagal memuat data.</p>
          : (
            <Table>
              <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="font-mono text-xs">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge>{u.role}</Badge></TableCell>
                    <TableCell><Badge variant={u.status === 'active' ? 'success' : 'destructive'}>{u.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Ubah</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteId(u.id)}>Hapus</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </CardContent></Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Ubah User' : 'Tambah User'}>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!editing} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          {!editing && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
              <div><Label>Konfirmasi</Label><Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required /></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Role</Label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="admin">admin</option>
                <option value="kasir">kasir</option>
                <option value="gudang">gudang</option>
              </select>
            </div>
            {editing && <div><Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>}
          </div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </form>
      </Modal>

      <Modal open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} title="Hapus User">
        <p className="text-sm text-muted-foreground">Yakin hapus user ini?</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Batal</Button>
          <Button variant="destructive" onClick={doDelete} className="flex-1">Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
