import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, todayUTC } from '@/lib/api-helpers'
import { ADJUSTMENT_REASONS } from '@/lib/constants'

// GET -> data form (daftar produk + alasan)
export async function GET() {
  const { error } = await authOr401()
  if (error) return error
  const products = await db.product.findMany({
    where: { deletedAt: null },
    select: { id: true, code: true, name: true, stock: true, unit: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ success: true, data: { products, reasons: ADJUSTMENT_REASONS } })
}

export async function POST(request: NextRequest) {
  const { user, error } = await authOr401()
  if (error || !user) return error
  const body = (await request.json().catch(() => null)) as {
    product_id?: unknown; physical_stock?: unknown; reason?: unknown; notes?: unknown
  } | null
  const productId = Number(body?.product_id)
  const physicalStock = Number(body?.physical_stock)
  const reason = String(body?.reason ?? '')

  if (!productId || !Number.isInteger(physicalStock) || physicalStock < 0 || !ADJUSTMENT_REASONS.includes(reason)) {
    return NextResponse.json({ success: false, message: 'Data tidak valid (produk, stok fisik >= 0, alasan valid)' }, { status: 422 })
  }
  const product = await db.product.findFirst({ where: { id: productId, deletedAt: null } })
  if (!product) return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 422 })

  const previousStock = product.stock
  const difference = physicalStock - previousStock

  await db.$transaction([
    db.product.update({ where: { id: productId }, data: { stock: physicalStock } }),
    db.stockMovement.create({
      data: {
        productId, type: 'adjustment', quantity: difference,
        previousStock, newStock: physicalStock, reason,
        notes: body?.notes != null ? String(body.notes) : null,
        userId: user.id, movementDate: todayUTC(),
      },
    }),
  ])

  return NextResponse.json({ success: true, message: 'Penyesuaian stok berhasil disimpan' }, { status: 201 })
}
