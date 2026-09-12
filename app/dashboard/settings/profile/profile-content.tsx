'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiSend } from '@/lib/client-api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileContent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const { show } = useToast()
  const qc = useQueryClient()

  const { isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const d = await apiGet<{ success: boolean; data: { user: { name: string; email: string } } }>('/api/settings/profile')
      setName(d.data.user.name)
      setEmail(d.data.user.email)
      setLoaded(true)
      return d
    },
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password && password !== confirm) { show('Konfirmasi password tidak cocok', 'error'); return }
    setSaving(true)
    try {
      await apiSend('/api/settings/profile', 'PUT', {
        name, email,
        ...(password ? { current_password: currentPassword, password, password_confirmation: confirm } : {}),
      })
      show('Profile berhasil diperbarui')
      setCurrentPassword(''); setPassword(''); setConfirm('')
      qc.invalidateQueries({ queryKey: ['profile'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Profil</h1>
      <Card>
        <CardHeader><CardTitle>Data Akun</CardTitle></CardHeader>
        <CardContent>
          {isLoading && !loaded ? <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : (
            <form onSubmit={submit} className="space-y-4">
              <div><Label>Nama</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="border-t border-s-muted pt-4">
                <p className="mb-3 text-sm font-medium">Ganti Password (opsional)</p>
                <div className="space-y-3">
                  <div><Label>Password Lama</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Password Baru</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                    <div><Label>Konfirmasi</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
