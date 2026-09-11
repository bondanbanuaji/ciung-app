import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, formattedMovementId, isoDate, num, paginationMeta, paging } from '@/lib/api-helpers'

async function generateCode(): Promise<string> {
  const last = await db.customer.findFirst({ where: { code: { startsWith: 'CUS-' } }, orderBy: { code: 'desc' } })
  if (!last) return 'CUS-001'
  const n = parseInt(last.code.slice(4), 10)
  return `CUS-${String((Number.isFinite(n) ? n : 0) + 1).padStart(3, '0')}`
}

async function customerStats(id: number) {
  const [tx, sum] = await Promise.all([
    db.stockMovement.count({ where: { customerId: id, type: 'keluar' } }),
    db.stockMovement.aggregate({ _sum: { total: true }, where: { customerId: id, type: 'keluar' } }),
  ])
  return { totalTransactions: tx, totalPurchase: sum._sum.total == null ? 0 : num(sum._sum.total) }
}

export async function GET(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)

  const code = url.searchParams.get('code')
  if (code) {
    const c = await db.customer.findUnique({ where: { code } })
    if (!c) return NextResponse.json({ success: false, message: 'Customer tidak ditemukan' }, { status: 404 })
    const stats = await customerStats(c.id)
    const movements = await db.stockMovement.findMany({
      where: { customerId: c.id },
      include: { product: true, user: true },
      orderBy: [{ movementDate: 'desc' }, { id: 'desc' }],
      take: 20,
    })
    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: c.id, code: c.code, name: c.name, phone: c.phone, email: c.email,
          address: c.address, notes: c.notes, ...stats, joinedAt: isoDate(c.createdAt),
        },
        transactions: movements.map((m) => ({
          id: formattedMovementId(m.movementDate, m.id),
          date: m.movementDate.toISOString(),
          type: m.type,
          productName: m.product.name,
          productCode: m.product.code,
          qty: m.quantity,
          total: m.total == null ? 0 : num(m.total),
          status: 'selesai',
          user: m.user?.name ?? 'System',
        })),
      },
    })
  }

  const search = url.searchParams.get('search') ?? ''
  const { page, perPage, skip } = paging(url)
  const where = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { code: { contains: search, mode: 'insensitive' as const } }] }
    : {}
  const [total, rows] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({ where, orderBy: { name: 'asc' }, skip, take: perPage }),
  ])
  const data = await Promise.all(
    rows.map(async (c) => ({
      id: c.id, code: c.code, name: c.name, phone: c.phone, email: c.email,
      address: c.address, notes: c.notes,
      ...(await customerStats(c.id)),
      joinedAt: isoDate(c.createdAt),
    }))
  )
  return NextResponse.json({
    success: true,
    data: data.map((d) => ({
      id: d.id, code: d.code, name: d.name, phone: d.phone, email: d.email,
      address: d.address, notes: d.notes,
      totalTransactions: d.totalTransactions, totalPurchase: d.totalPurchase, joinedAt: d.joinedAt,
    })),
    pagination: paginationMeta(page, perPage, total),
  })
}

export async function POST(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const body = (await request.json().catch(() => null)) as Record<string, string> | null
  if (!body?.name?.trim()) return NextResponse.json({ success: false, message: 'Nama wajib diisi' }, { status: 422 })
  await db.customer.create({
    data: {
      code: await generateCode(),
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  })
  return NextResponse.json({ success: true, message: 'Customer berhasil ditambahkan' }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  const body = (await request.json().catch(() => null)) as Record<string, string> | null
  if (!body?.name?.trim()) return NextResponse.json({ success: false, message: 'Nama wajib diisi' }, { status: 422 })
  await db.customer.update({
    where: { id },
    data: {
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  })
  return NextResponse.json({ success: true, message: 'Customer berhasil diperbarui' })
}

export async function DELETE(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  const used = await db.stockMovement.count({ where: { customerId: id } })
  if (used > 0) {
    return NextResponse.json(
      { success: false, message: 'Tidak dapat menghapus customer yang masih memiliki riwayat transaksi' },
      { status: 422 }
    )
  }
  await db.customer.delete({ where: { id } })
  return NextResponse.json({ success: true, message: 'Customer berhasil dihapus' })
}
