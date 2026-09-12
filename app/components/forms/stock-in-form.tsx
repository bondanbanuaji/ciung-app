'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiSend } from '@/lib/client-api'
import { formatRupiah } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

interface Option { id: number; code: string; name: string; company?: string | null; stock?: number; unit?: string; costPrice?: number }

export function StockInForm() {
  const [supplierId, setSupplierId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [costPrice, setCostPrice] = useState(0)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const { show } = useToast()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['stock-in-form'],
    queryFn: () => apiGet<{ success: boolean; data: { suppliers: Option[]; products: Option[] } }>('/api/stock-in'),
  })
  const suppliers = data?.data.suppliers ?? []
  const products = data?.data.products ?? []
  const selected = products.find((p) => String(p.id) === productId)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiSend('/api/stock-in', 'POST', {
        supplier_id: Number(supplierId), product_id: Number(productId),
        quantity: Number(quantity), cost_price: Number(costPrice), notes: notes || undefined,
      })
      show('Barang masuk berhasil dicatat')
      setProductId(''); setQuantity(1); setCostPrice(0); setNotes('')
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
      <h1 className="font-display text-2xl font-semibold text-foreground">Barang Masuk</h1>
      <Card>
        <CardHeader><CardTitle>Formulir Penerimaan Barang</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Supplier</Label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Pilih supplier...</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.company ?? s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <Label>Produk</Label>
                <select value={productId} onChange={(e) => { setProductId(e.target.value); const p = products.find((x) => String(x.id) === e.target.value); if (p?.costPrice) setCostPrice(p.costPrice) }} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Pilih produk...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name} (stok: {p.stock})</option>)}
                </select>
                {selected && <p className="mt-1 text-xs text-muted-foreground">Stok saat ini: {selected.stock} {selected.unit} • Harga modal terakhir: {formatRupiah(selected.costPrice ?? 0)}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Jumlah</Label><Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required /></div>
                <div><Label>Harga Modal / Satuan</Label><Input type="number" min={0} value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} required /></div>
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
