import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, num, todayUTC } from '@/lib/api-helpers'

// GET -> data form (daftar supplier + produk), samakan Laravel StockInController@form
export async function GET() {
  const { error } = await authOr401()
  if (error) return error
  const [suppliers, products] = await Promise.all([
    db.supplier.findMany({ select: { id: true, code: true, company: true, name: true, phone: true }, orderBy: { name: 'asc' } }),
    db.product.findMany({
      where: { deletedAt: null },
      include: { supplier: { select: { code: true } } },
      orderBy: { name: 'asc' },
    }),
  ])
  return NextResponse.json({
    success: true,
    data: {
      suppliers,
      products: products.map((p) => ({
        id: p.id, code: p.code, name: p.name, stock: p.stock, unit: p.unit,
        costPrice: num(p.costPrice), supplierCode: p.supplier?.code ?? null,
      })),
    },
  })
}

export async function POST(request: NextRequest) {
  const { user, error } = await authOr401()
  if (error || !user) return error
  const body = (await request.json().catch(() => null)) as {
    supplier_id?: unknown; product_id?: unknown; quantity?: unknown; cost_price?: unknown; notes?: unknown
  } | null
  const supplierId = Number(body?.supplier_id)
  const productId = Number(body?.product_id)
  const quantity = Number(body?.quantity)
  const costPrice = Number(body?.cost_price)

  if (!supplierId || !productId || !Number.isInteger(quantity) || quantity < 1 || Number.isNaN(costPrice) || costPrice < 0) {
    return NextResponse.json({ success: false, message: 'Data tidak valid (supplier, produk, qty >= 1, harga >= 0)' }, { status: 422 })
  }
  const [supplier, product] = await Promise.all([
    db.supplier.findUnique({ where: { id: supplierId } }),
    db.product.findFirst({ where: { id: productId, deletedAt: null } }),
  ])
  if (!supplier) return NextResponse.json({ success: false, message: 'Supplier tidak ditemukan' }, { status: 422 })
  if (!product) return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 422 })

  const previousStock = product.stock
  const newStock = previousStock + quantity
  const total = quantity * costPrice

  await db.$transaction([
    db.product.update({
      where: { id: productId },
      data: { stock: newStock, costPrice, sellingPrice: costPrice * (1 + product.markup / 100) },
    }),
    db.stockMovement.create({
      data: {
        productId, supplierId, type: 'masuk', quantity,
        previousStock, newStock, costPrice, unitPrice: costPrice, total,
        notes: body?.notes != null ? String(body.notes) : null,
        userId: user.id, movementDate: todayUTC(),
      },
    }),
  ])

  return NextResponse.json({ success: true, message: 'Barang masuk berhasil dicatat' }, { status: 201 })
}
