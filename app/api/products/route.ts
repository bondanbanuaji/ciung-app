import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, num, paginationMeta, paging, stockStatus } from '@/lib/api-helpers'

function serialize(p: {
  id: number
  code: string
  name: string
  category: { name: string; slug: string }
  categoryId: number
  unit: string
  stock: number
  minStock: number
  costPrice: unknown
  markup: number
  sellingPrice: unknown
  supplierId: number | null
  supplier: { code: string; name: string } | null
  image: string | null
  updatedAt: Date
}) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    category: p.category.name,
    categorySlug: p.category.slug,
    category_id: p.categoryId,
    unit: p.unit,
    stock: p.stock,
    minStock: p.minStock,
    costPrice: num(p.costPrice),
    markup: p.markup,
    sellingPrice: num(p.sellingPrice),
    supplier_id: p.supplierId,
    supplierCode: p.supplier?.code ?? null,
    supplierName: p.supplier?.name ?? null,
    status: stockStatus(p.stock, p.minStock),
    image: p.image,
    lastUpdated: p.updatedAt.toISOString().slice(0, 10),
  }
}

export async function GET(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? ''
  const category = url.searchParams.get('category') ?? ''
  const status = url.searchParams.get('status') ?? ''
  const sort = url.searchParams.get('sort') ?? 'name'
  const { page, perPage, skip } = paging(url, 8)

  const where: Record<string, unknown> = { deletedAt: null }
  if (search) where.OR = [{ code: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }]
  if (category) where.category = { slug: category }

  let candidates = await db.product.findMany({
    where,
    include: { category: true, supplier: true },
  })

  if (status === 'aman') candidates = candidates.filter((p) => p.stock > p.minStock)
  else if (status === 'rendah') candidates = candidates.filter((p) => p.stock > 0 && p.stock <= p.minStock)
  else if (status === 'habis') candidates = candidates.filter((p) => p.stock === 0)

  const sorters: Record<string, (a: (typeof candidates)[number], b: (typeof candidates)[number]) => number> = {
    'stock-asc': (a, b) => a.stock - b.stock,
    'stock-desc': (a, b) => b.stock - a.stock,
    'price-asc': (a, b) => num(a.sellingPrice) - num(b.sellingPrice),
    'price-desc': (a, b) => num(b.sellingPrice) - num(a.sellingPrice),
  }
  candidates.sort(sorters[sort] ?? ((a, b) => a.name.localeCompare(b.name)))

  const total = candidates.length
  const rows = candidates.slice(skip, skip + perPage)
  const categories = await db.category.findMany({ select: { id: true, name: true, slug: true } })

  return NextResponse.json({
    success: true,
    data: {
      products: rows.map(serialize),
      categories,
      filters: { search, category, status, sort },
      pagination: paginationMeta(page, perPage, total),
    },
  })
}

async function generateCode(): Promise<string> {
  const last = await db.product.findFirst({
    where: { code: { startsWith: 'CW-' }, deletedAt: null },
    orderBy: { code: 'desc' },
  })
  if (!last) return 'CW-001'
  const n = parseInt(last.code.slice(3), 10)
  return `CW-${String((Number.isFinite(n) ? n : 0) + 1).padStart(3, '0')}`
}

function validateProductInput(b: Record<string, unknown>) {
  const errs: Record<string, string[]> = {}
  if (!b.name || String(b.name).length > 255) errs.name = ['Nama wajib diisi (maks 255).']
  if (!Number.isInteger(Number(b.category_id))) errs.category_id = ['Kategori tidak valid.']
  if (!b.unit || String(b.unit).length > 50) errs.unit = ['Satuan wajib diisi.']
  if (!Number.isInteger(Number(b.min_stock)) || Number(b.min_stock) < 0) errs.min_stock = ['Stok minimal harus bilangan >= 0.']
  if (Number.isNaN(Number(b.cost_price)) || Number(b.cost_price) < 0) errs.cost_price = ['Harga modal harus >= 0.']
  if (!Number.isInteger(Number(b.markup)) || Number(b.markup) < 0 || Number(b.markup) > 100)
    errs.markup = ['Markup harus 0–100.']
  return errs
}

export async function POST(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ success: false, message: 'Payload tidak valid' }, { status: 400 })
  const errs = validateProductInput(body)
  if (Object.keys(errs).length) return NextResponse.json({ success: false, message: 'Validasi gagal', errors: errs }, { status: 422 })

  const category = await db.category.findUnique({ where: { id: Number(body.category_id) } })
  if (!category) return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan' }, { status: 422 })
  if (body.supplier_id != null) {
    const sup = await db.supplier.findUnique({ where: { id: Number(body.supplier_id) } })
    if (!sup) return NextResponse.json({ success: false, message: 'Supplier tidak ditemukan' }, { status: 422 })
  }

  const cost = Number(body.cost_price)
  const markup = Number(body.markup)
  await db.product.create({
    data: {
      code: await generateCode(),
      name: String(body.name),
      categoryId: Number(body.category_id),
      unit: String(body.unit),
      minStock: Number(body.min_stock),
      costPrice: cost,
      markup,
      sellingPrice: cost * (1 + markup / 100),
      supplierId: body.supplier_id != null ? Number(body.supplier_id) : null,
      stock: 0,
    },
  })
  return NextResponse.json({ success: true, message: 'Barang berhasil ditambahkan' }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)
  const id = Number(url.searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ success: false, message: 'Payload tidak valid' }, { status: 400 })
  const errs = validateProductInput(body)
  if (Object.keys(errs).length) return NextResponse.json({ success: false, message: 'Validasi gagal', errors: errs }, { status: 422 })

  const product = await db.product.findFirst({ where: { id, deletedAt: null } })
  if (!product) return NextResponse.json({ success: false, message: 'Barang tidak ditemukan' }, { status: 404 })

  const cost = Number(body.cost_price)
  const markup = Number(body.markup)
  await db.product.update({
    where: { id },
    data: {
      name: String(body.name),
      categoryId: Number(body.category_id),
      unit: String(body.unit),
      minStock: Number(body.min_stock),
      costPrice: cost,
      markup,
      sellingPrice: cost * (1 + markup / 100),
      supplierId: body.supplier_id != null ? Number(body.supplier_id) : null,
    },
  })
  return NextResponse.json({ success: true, message: 'Barang berhasil diperbarui' })
}

export async function DELETE(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)
  const id = Number(url.searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })

  const used = await db.stockMovement.count({ where: { productId: id } })
  if (used > 0) {
    return NextResponse.json(
      { success: false, message: 'Tidak dapat menghapus barang yang memiliki riwayat transaksi' },
      { status: 422 }
    )
  }
  await db.product.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ success: true, message: 'Barang berhasil dihapus' })
}
