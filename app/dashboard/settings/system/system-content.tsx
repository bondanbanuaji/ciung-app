'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiSend } from '@/lib/client-api'
import { STORE_LOGO_PNG, STORE_LOGO_WEBP } from '@/lib/brand'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

interface Branding {
  name: string
  address: string
  phone: string
  logoPath: string
}

export function SystemContent() {
  const qc = useQueryClient()
  const { show } = useToast()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['store-branding-admin'],
    queryFn: () => apiGet<{ success: boolean; data: Branding }>('/api/settings/system'),
  })

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [logoPath, setLogoPath] = useState(STORE_LOGO_WEBP)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name)
      setAddress(data.data.address)
      setPhone(data.data.phone)
      setLogoPath(data.data.logoPath)
    }
  }, [data])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiSend('/api/settings/system', 'PUT', { name, address, phone, logoPath })
      show('Identitas toko berhasil disimpan')
      qc.invalidateQueries({ queryKey: ['store-branding'] })
      qc.invalidateQueries({ queryKey: ['store-branding-admin'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Sistem</h1>
      <Card>
        <CardHeader><CardTitle>Logo Toko</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-24" />
            : isError ? <p className="text-sm text-destructive">Gagal memuat data.</p>
            : (
              <div className="flex items-center gap-4">
                <img src={STORE_LOGO_WEBP} alt="Logo webp (aktif di aplikasi)" className="h-20 w-20 rounded-xl object-contain ring-1 ring-border" />
                <div className="text-sm">
                  <p className="font-medium">webp — logo aktif di aplikasi (ringan)</p>
                  <p className="mt-1 text-muted-foreground">Master resolusi penuh:</p>
                  <a href={STORE_LOGO_PNG} target="_blank" rel="noreferrer" className="text-primary underline">ciung__logo.png (5000×5000)</a>
                  <p className="mt-1 text-muted-foreground">Favicon browser: <span className="font-mono">ciung__logo.ico</span></p>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Identitas Toko</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
            : isError ? <p className="text-sm text-destructive">Gagal memuat data.</p>
            : (
              <form onSubmit={submit} className="space-y-3">
                <p className="text-xs text-muted-foreground">Dipakai di kop laporan, ekspor CSV, halaman login & sidebar.</p>
                <div><Label>Nama Toko</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><Label>Alamat</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. ..." /></div>
                <div><Label>Telepon</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08..." /></div>
                <div><Label>Logo aktif</Label>
                  <select value={logoPath} onChange={(e) => setLogoPath(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    <option value={STORE_LOGO_WEBP}>webp — ringan (disarankan)</option>
                    <option value={STORE_LOGO_PNG}>png — resolusi penuh</option>
                  </select>
                </div>
                <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
              </form>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
