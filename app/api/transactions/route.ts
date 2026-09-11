import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, dayBounds, formattedMovementId, num, paginationMeta, paging } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)
  const type = url.searchParams.get('type') ?? ''
  const search = url.searchParams.get('search') ?? ''
  const dateFrom = url.searchParams.get('date_from') ?? ''
  const dateTo = url.searchParams.get('date_to') ?? ''
  const { page, perPage, skip } = paging(url)

  const where: Record<string, unknown> = {}
  if (type === 'masuk' || type === 'keluar' || type === 'adjustment') where.type = type
  if (search) {
    where.product = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ],
    }
  }
  if (dateFrom) where.movementDate = { ...(where.movementDate as object | undefined), gte: dayBounds(dateFrom).gte }
  if (dateTo) where.movementDate = { ...(where.movementDate as object | undefined), lt: dayBounds(dateTo).lt }

  const [total, rows] = await Promise.all([
    db.stockMovement.count({ where }),
    db.stockMovement.findMany({
      where,
      include: { product: { include: { category: true } }, supplier: true, customer: true, user: true },
      orderBy: [{ movementDate: 'desc' }, { id: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      transactions: rows.map((m) => ({
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
      filters: { type, search, date_from: dateFrom, date_to: dateTo },
      pagination: paginationMeta(page, perPage, total),
    },
  })
}
