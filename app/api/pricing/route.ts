import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, num, paginationMeta, paging } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? ''
  const categoryId = Number(url.searchParams.get('category_id')) || 0
  const { page, perPage, skip } = paging(url)

  const where: Record<string, unknown> = { deletedAt: null }
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (categoryId) where.categoryId = categoryId

  const [total, rows, categories] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({ where, include: { category: true, supplier: true }, orderBy: { name: 'asc' }, skip, take: perPage }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      products: rows.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category.name,
        basePrice: num(p.costPrice),
        currentPrice: num(p.sellingPrice),
        markup: p.markup,
      })),
      categories,
      filters: { search, category_id: categoryId || null },
      pagination: paginationMeta(page, perPage, total),
    },
  })
}

// PUT ?id= : update harga satu produk { cost_price, markup } (selling_price dihitung)
export async function PUT(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  const body = (await request.json().catch(() => null)) as { cost_price?: unknown; markup?: unknown } | null
  const cost = Number(body?.cost_price)
  const markup = Number(body?.markup)
  if (Number.isNaN(cost) || cost < 0 || !Number.isInteger(markup) || markup < 0 || markup > 100) {
    return NextResponse.json({ success: false, message: 'cost_price >= 0 dan markup 0–100 wajib' }, { status: 422 })
  }
  await db.product.update({ where: { id }, data: { costPrice: cost, markup, sellingPrice: cost * (1 + markup / 100) } })
  return NextResponse.json({ success: true, message: 'Harga berhasil diperbarui' })
}

// POST bulk { product_ids: number[], markup: number }
export async function POST(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const body = (await request.json().catch(() => null)) as { product_ids?: unknown; markup?: unknown } | null
  const ids = Array.isArray(body?.product_ids) ? body.product_ids.map(Number).filter((n) => n > 0) : []
  const markup = Number(body?.markup)
  if (!ids.length || !Number.isInteger(markup) || markup < 0 || markup > 100) {
    return NextResponse.json({ success: false, message: 'product_ids dan markup 0–100 wajib' }, { status: 422 })
  }
  const products = await db.product.findMany({ where: { id: { in: ids }, deletedAt: null } })
  await db.$transaction(
    products.map((p) =>
      db.product.update({
        where: { id: p.id },
        data: { markup, sellingPrice: num(p.costPrice) * (1 + markup / 100) },
      })
    )
  )
  return NextResponse.json({ success: true, message: 'Harga berhasil diperbarui' })
}
