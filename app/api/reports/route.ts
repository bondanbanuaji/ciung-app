import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, dayBounds, num, paginationMeta, paging } from '@/lib/api-helpers'

type Tab = 'stok' | 'masuk' | 'keluar' | 'penjualan'

function tabOf(v: string | null): Tab {
  return v === 'masuk' || v === 'keluar' || v === 'penjualan' ? v : 'stok'
}

export async function GET(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)
  const tab = tabOf(url.searchParams.get('tab'))
  const dateFrom = url.searchParams.get('date_from') ?? ''
  const dateTo = url.searchParams.get('date_to') ?? ''
  const categoryId = Number(url.searchParams.get('category_id')) || 0
  const supplierId = Number(url.searchParams.get('supplier_id')) || 0
  const customerId = Number(url.searchParams.get('customer_id')) || 0
  const { page, perPage, skip } = paging(url)

  const [categories, suppliers, customers] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.supplier.findMany({ orderBy: { name: 'asc' } }),
    db.customer.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (tab === 'stok') {
    const where: Record<string, unknown> = { deletedAt: null }
    if (categoryId) where.categoryId = categoryId
    if (supplierId) where.supplierId = supplierId
    const [total, rows] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: { category: true, supplier: true },
        orderBy: { name: 'asc' },
        skip,
        take: perPage,
      }),
    ])
    return NextResponse.json({
      success: true,
      data: {
        data: rows.map((p) => ({
          code: p.code, name: p.name, category: p.category.name,
          stock: p.stock, unit: p.unit,
          costPrice: num(p.costPrice), sellingPrice: num(p.sellingPrice),
          stockValue: p.stock * num(p.costPrice),
        })),
        pagination: paginationMeta(page, perPage, total),
        tab,
        categories, suppliers, customers,
        filters: { date_from: dateFrom, date_to: dateTo, category_id: categoryId || null, supplier_id: supplierId || null, customer_id: customerId || null },
      },
    })
  }

  const where: Record<string, unknown> = { type: tab === 'penjualan' ? 'keluar' : tab }
  if (dateFrom) where.movementDate = { ...((where.movementDate as object | undefined) ?? {}), gte: dayBounds(dateFrom).gte }
  if (dateTo) where.movementDate = { ...((where.movementDate as object | undefined) ?? {}), lt: dayBounds(dateTo).lt }
  if (categoryId) where.product = { categoryId }
  if (supplierId) where.supplierId = supplierId
  if (customerId) where.customerId = customerId

  const orderBy = tab === 'penjualan' ? [{ total: 'desc' as const }] : [{ movementDate: 'desc' as const }, { id: 'desc' as const }]
  const [total, rows] = await Promise.all([
    db.stockMovement.count({ where }),
    db.stockMovement.findMany({
      where,
      include: { product: { include: { category: true } }, supplier: true, customer: true },
      orderBy,
      skip,
      take: perPage,
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      data: rows.map((m) => ({
        id: m.id,
        date: m.movementDate.toISOString(),
        type: m.type,
        productCode: m.product.code,
        productName: m.product.name,
        category: m.product.category.name,
        qty: m.quantity,
        unitPrice: m.unitPrice == null ? 0 : num(m.unitPrice),
        total: m.total == null ? 0 : num(m.total),
        supplier: m.supplier?.company ?? null,
        customer: m.customer?.name ?? null,
      })),
      pagination: paginationMeta(page, perPage, total),
      tab,
      categories, suppliers, customers,
      filters: { date_from: dateFrom, date_to: dateTo, category_id: categoryId || null, supplier_id: supplierId || null, customer_id: customerId || null },
    },
  })
}
