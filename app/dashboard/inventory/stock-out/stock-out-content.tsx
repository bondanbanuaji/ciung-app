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

interface Customer { id: number; code: string; name: string }
interface Product { id: number; code: string; name: string; stock: number; unit: string; sellingPrice: number }

export function StockOutContent() {
  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const { show } = useToast()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['stock-out-form'],
    queryFn: () => apiGet<{ success: boolean; data: { customers: Customer[]; products: Product[] } }>('/api/stock-out'),
  })
  const customers = data?.data.customers ?? []
  const products = data?.data.products ?? []
  const selected = products.find((p) => String(p.id) === productId)
  const total = selected ? quantity * selected.sellingPrice : 0

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected && quantity > selected.stock) {
      show(`Stok tidak mencukupi. Stok saat ini: ${selected.stock}`, 'error')
      return
    }
    setSaving(true)
    try {
      await apiSend('/api/stock-out', 'POST', {
        customer_id: Number(customerId), product_id: Number(productId),
        quantity: Number(quantity), notes: notes || undefined,
      })
      show('Barang keluar berhasil dicatat')
      setProductId(''); setQuantity(1); setNotes('')
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
      <h1 className="text-2xl font-bold text-foreground">Barang Keluar</h1>
      <Card>
        <CardHeader><CardTitle>Formulir Penjualan / Pengeluaran</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Customer</Label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Pilih customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div>
                <Label>Produk</Label>
                <select value={productId} onChange={(e) => setProductId(e.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Pilih produk...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name} (stok: {p.stock})</option>)}
                </select>
                {selected && <p className="mt-1 text-xs text-muted-foreground">Harga jual: {formatRupiah(selected.sellingPrice)} • Estimasi total: {formatRupiah(total)}</p>}
              </div>
              <div><Label>Jumlah</Label><Input type="number" min={1} max={selected?.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required /></div>
              <div><Label>Catatan (opsional)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              <Button type="submit" disabled={saving} className="w-full">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
