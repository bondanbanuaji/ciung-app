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

interface Product { id: number; code: string; name: string; stock: number; unit: string }

export function AdjustmentContent() {
  const [productId, setProductId] = useState('')
  const [physicalStock, setPhysicalStock] = useState(0)
  const [reason, setReason] = useState('Stock Opname')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const { show } = useToast()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['adjustment-form'],
    queryFn: () => apiGet<{ success: boolean; data: { products: Product[]; reasons: string[] } }>('/api/adjustment'),
  })
  const products = data?.data.products ?? []
  const reasons = data?.data.reasons ?? []
  const selected = products.find((p) => String(p.id) === productId)
  const diff = selected ? physicalStock - selected.stock : 0

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiSend('/api/adjustment', 'POST', {
        product_id: Number(productId), physical_stock: Number(physicalStock),
        reason, notes: notes || undefined,
      })
      show('Penyesuaian stok berhasil disimpan')
      setProductId(''); setNotes('')
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    } catch (err: any) {
      show(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Adjustment Stok</h1>
      <Card>
        <CardHeader><CardTitle>Stock Opname</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Produk</Label>
                <select value={productId} onChange={(e) => { setProductId(e.target.value); const p = products.find((x) => String(x.id) === e.target.value); if (p) setPhysicalStock(p.stock) }} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Pilih produk...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name} (sistem: {p.stock})</option>)}
                </select>
              </div>
              <div><Label>Stok Fisik</Label><Input type="number" min={0} value={physicalStock} onChange={(e) => setPhysicalStock(Number(e.target.value))} required /></div>
              {selected && <p className="text-sm">Selisih: <span className={diff === 0 ? 'text-muted-foreground' : diff > 0 ? 'font-semibold text-success' : 'font-semibold text-destructive'}>{diff > 0 ? `+${diff}` : diff} {selected.unit}</span></p>}
              <div>
                <Label>Alasan</Label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div><Label>Catatan (opsional)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
