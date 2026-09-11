import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, num, stockStatus, todayUTC } from '@/lib/api-helpers'

// GET -> data form (daftar customer + produk yang ada stoknya)
export async function GET() {
  const { error } = await authOr401()
  if (error) return error
  const [customers, products] = await Promise.all([
    db.customer.findMany({ select: { id: true, code: true, name: true, phone: true }, orderBy: { name: 'asc' } }),
    db.product.findMany({
      where: { deletedAt: null, stock: { gt: 0 } },
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
  ])
  return NextResponse.json({
    success: true,
    data: {
      customers,
      products: products.map((p) => ({
        id: p.id, code: p.code, name: p.name, category: p.category.name,
        stock: p.stock, minStock: p.minStock, unit: p.unit,
        sellingPrice: num(p.sellingPrice), markup: p.markup, status: stockStatus(p.stock, p.minStock),
      })),
    },
  })
}

export async function POST(request: NextRequest) {
  const { user, error } = await authOr401()
  if (error || !user) return error
  const body = (await request.json().catch(() => null)) as {
    customer_id?: unknown; product_id?: unknown; quantity?: unknown; notes?: unknown
  } | null
  const customerId = Number(body?.customer_id)
  const productId = Number(body?.product_id)
  const quantity = Number(body?.quantity)

  if (!customerId || !productId || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ success: false, message: 'Data tidak valid (customer, produk, qty >= 1)' }, { status: 422 })
  }
  const [customer, product] = await Promise.all([
    db.customer.findUnique({ where: { id: customerId } }),
    db.product.findFirst({ where: { id: productId, deletedAt: null } }),
  ])
  if (!customer) return NextResponse.json({ success: false, message: 'Customer tidak ditemukan' }, { status: 422 })
  if (!product) return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 422 })
  if (product.stock < quantity) {
    return NextResponse.json(
      { success: false, message: `Stok tidak mencukupi. Stok saat ini: ${product.stock}` },
      { status: 422 }
    )
  }

  const previousStock = product.stock
  const newStock = previousStock - quantity
  const total = quantity * num(product.sellingPrice)

  await db.$transaction([
    db.product.update({ where: { id: productId }, data: { stock: newStock } }),
    db.stockMovement.create({
      data: {
        productId, customerId, type: 'keluar', quantity: -quantity,
        previousStock, newStock, unitPrice: product.sellingPrice, total,
        notes: body?.notes != null ? String(body.notes) : null,
        userId: user.id, movementDate: todayUTC(),
      },
    }),
  ])

  return NextResponse.json({ success: true, message: 'Barang keluar berhasil dicatat' }, { status: 201 })
}
