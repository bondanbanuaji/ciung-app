import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, slugify } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await authOr401()
  if (error) return error
  const categories = await db.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json({
    success: true,
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      color: c.color,
      products_count: c._count.products,
    })),
  })
}

export async function POST(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const body = (await request.json().catch(() => null)) as { name?: string; icon?: string; color?: string } | null
  const name = String(body?.name ?? '').trim()
  if (!name) return NextResponse.json({ success: false, message: 'Nama wajib diisi' }, { status: 422 })
  if (await db.category.findFirst({ where: { name } })) {
    return NextResponse.json({ success: false, message: 'Nama kategori sudah dipakai' }, { status: 422 })
  }
  await db.category.create({
    data: { name, slug: slugify(name), icon: body?.icon || null, color: body?.color || null },
  })
  return NextResponse.json({ success: true, message: 'Kategori berhasil ditambahkan' }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  const body = (await request.json().catch(() => null)) as { name?: string; icon?: string; color?: string } | null
  const name = String(body?.name ?? '').trim()
  if (!name) return NextResponse.json({ success: false, message: 'Nama wajib diisi' }, { status: 422 })
  const dup = await db.category.findFirst({ where: { name, NOT: { id } } })
  if (dup) return NextResponse.json({ success: false, message: 'Nama kategori sudah dipakai' }, { status: 422 })
  await db.category.update({ where: { id }, data: { name, slug: slugify(name), icon: body?.icon || null, color: body?.color || null } })
  return NextResponse.json({ success: true, message: 'Kategori berhasil diperbarui' })
}

export async function DELETE(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  const used = await db.product.count({ where: { categoryId: id, deletedAt: null } })
  if (used > 0) {
    return NextResponse.json(
      { success: false, message: 'Tidak dapat menghapus kategori yang masih memiliki barang' },
      { status: 422 }
    )
  }
  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' })
}
