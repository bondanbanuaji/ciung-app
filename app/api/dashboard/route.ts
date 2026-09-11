import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, dayBounds, formattedMovementId, num, stockStatus, todayUTC } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await authOr401()
  if (error) return error

  const today = todayUTC()
  const { gte: todayStart, lt: todayEnd } = dayBounds(today.toISOString())

  const [totalProducts, stockAgg, valueRows, stockInToday, stockOutToday, outOfStock, totalSuppliers, totalCustomers] =
    await Promise.all([
      db.product.count({ where: { deletedAt: null } }),
      db.product.aggregate({ _sum: { stock: true }, where: { deletedAt: null } }),
      db.product.findMany({ where: { deletedAt: null }, select: { stock: true, minStock: true, costPrice: true } }),
      db.stockMovement.count({ where: { type: 'masuk', movementDate: { gte: todayStart, lt: todayEnd } } }),
      db.stockMovement.count({ where: { type: 'keluar', movementDate: { gte: todayStart, lt: todayEnd } } }),
      db.product.count({ where: { deletedAt: null, stock: 0 } }),
      db.supplier.count(),
      db.customer.count(),
    ])

  const lowStockCount = valueRows.filter((p) => p.stock > 0 && p.stock <= p.minStock).length
  const inventoryValue = valueRows.reduce((sum, p) => sum + p.stock * num(p.costPrice), 0)

  const lowCandidates = await db.product.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: { stock: 'asc' },
    take: 20,
  })
  const low5 = lowCandidates
    .filter((p) => p.stock <= p.minStock)
    .slice(0, 5)
    .map((p) => ({
      code: p.code,
      name: p.name,
      category: p.category.name,
      stock: p.stock,
      unit: p.unit,
      status: stockStatus(p.stock, p.minStock),
    }))

  const recent = await db.stockMovement.findMany({
    include: { product: { include: { category: true } }, supplier: true, customer: true, user: true },
    orderBy: [{ movementDate: 'desc' }, { id: 'desc' }],
    take: 5,
  })

  const labels: string[] = []
  const masuk: number[] = []
  const keluar: number[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    labels.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'UTC' }))
    const { gte, lt } = dayBounds(d.toISOString())
    const [mIn, mOut] = await Promise.all([
      db.stockMovement.aggregate({ _sum: { quantity: true }, where: { type: 'masuk', movementDate: { gte, lt } } }),
      db.stockMovement.aggregate({ _sum: { quantity: true }, where: { type: 'keluar', movementDate: { gte, lt } } }),
    ])
    masuk.push(mIn._sum.quantity ?? 0)
    keluar.push(Math.abs(mOut._sum.quantity ?? 0))
  }

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalProducts,
        totalStock: stockAgg._sum.stock ?? 0,
        inventoryValue,
        stockInToday,
        stockOutToday,
        lowStock: lowStockCount,
        outOfStock,
        totalSuppliers,
        totalCustomers,
      },
      lowStockProducts: low5,
      recentTransactions: recent.map((m) => ({
        id: formattedMovementId(m.movementDate, m.id),
        date: m.movementDate.toISOString(),
        type: m.type,
        productCode: m.product.code,
        productName: m.product.name,
        category: m.product.category.name,
        supplier: m.supplier?.company ?? null,
        supplierCode: m.supplier?.code ?? null,
        customer: m.customer?.name ?? null,
        customerCode: m.customer?.code ?? null,
        qty: m.quantity,
        unitPrice: m.unitPrice == null ? 0 : num(m.unitPrice),
        total: m.total == null ? 0 : num(m.total),
        status: 'selesai',
        reason: m.reason,
        user: m.user?.name ?? 'System',
      })),
      chartData: { labels, masuk, keluar },
    },
  })
}
