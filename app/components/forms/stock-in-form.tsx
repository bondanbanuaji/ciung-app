'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const stockInSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier wajib dipilih'),
  product_id: z.string().min(1, 'Produk wajib dipilih'),
  quantity: z.number().min(1, 'Jumlah minimal 1'),
  cost_price: z.number().min(0),
  notes: z.string().optional(),
})

export type StockInFormValues = z.infer<typeof stockInSchema>

export function StockInForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StockInFormValues>({
    resolver: zodResolver(stockInSchema),
  })
  const [isPending, startTransition] = useTransition()
  const { show } = useToast()

  const onSubmit = async (data: StockInFormValues) => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/stock-in', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json().catch(() => null)
        if (res.ok && result?.success !== false) {
          show('Barang masuk berhasil!', 'success')
        } else {
          show(result?.message || 'Gagal menambah barang', 'error')
        }
      } catch {
        show('Terjadi kesalahan', 'error')
      }
    })
  }

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Supplier</Label>
          <Input {...register('supplier_id')} className={errors.supplier_id ? 'border-destructive' : ''} />
          {errors.supplier_id && <p className="mt-1 text-xs text-destructive">{errors.supplier_id.message}</p>}
        </div>
        <div>
          <Label>Produk</Label>
          <Input {...register('product_id')} className={errors.product_id ? 'border-destructive' : ''} />
          {errors.product_id && <p className="mt-1 text-xs text-destructive">{errors.product_id.message}</p>}
        </div>
        <div>
          <Label>Jumlah</Label>
          <Input type="number" {...register('quantity', { valueAsNumber: true })} className={errors.quantity ? 'border-destructive' : ''} />
          {errors.quantity && <p className="mt-1 text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
        <div>
          <Label>Harga Modal</Label>
          <Input type="number" {...register('cost_price', { valueAsNumber: true })} className={errors.cost_price ? 'border-destructive' : ''} />
          {errors.cost_price && <p className="mt-1 text-xs text-destructive">{errors.cost_price.message}</p>}
        </div>
        <div>
          <Label>Catatan</Label>
          <Input {...register('notes')} />
        </div>
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </div>
  )
}
