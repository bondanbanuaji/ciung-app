import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { authOr401 } from '@/lib/api-helpers'
import { toPublicUser } from '@/lib/auth/user'

const ROLES = ['admin', 'kasir', 'gudang'] as const

export async function GET() {
  const { error } = await authOr401()
  if (error) return error
  const users = await db.user.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ success: true, data: users.map(toPublicUser) })
}

export async function POST(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const name = String(body?.name ?? '').trim()
  const username = String(body?.username ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const password = String(body?.password ?? '')
  const passwordConfirmation = String(body?.password_confirmation ?? body?.passwordConfirmation ?? '')
  const role = String(body?.role ?? '')

  if (!name || !username || !email) {
    return NextResponse.json({ success: false, message: 'Nama, username, dan email wajib diisi' }, { status: 422 })
  }
  if (password.length < 8) {
    return NextResponse.json({ success: false, message: 'Password minimal 8 karakter' }, { status: 422 })
  }
  if (password !== passwordConfirmation) {
    return NextResponse.json({ success: false, message: 'Konfirmasi password tidak cocok' }, { status: 422 })
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return NextResponse.json({ success: false, message: 'Role harus admin/kasir/gudang' }, { status: 422 })
  }
  if (await db.user.findFirst({ where: { OR: [{ username }, { email }] } })) {
    return NextResponse.json({ success: false, message: 'Username atau email sudah dipakai' }, { status: 422 })
  }

  await db.user.create({
    data: { name, username, email, password: await bcrypt.hash(password, 10), role: role as (typeof ROLES)[number], status: 'active' },
  })
  return NextResponse.json({ success: true, message: 'User berhasil ditambahkan' }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const role = String(body?.role ?? '')
  const status = String(body?.status ?? '')

  if (!name || !email) {
    return NextResponse.json({ success: false, message: 'Nama dan email wajib diisi' }, { status: 422 })
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return NextResponse.json({ success: false, message: 'Role harus admin/kasir/gudang' }, { status: 422 })
  }
  if (status !== 'active' && status !== 'inactive') {
    return NextResponse.json({ success: false, message: 'Status harus active/inactive' }, { status: 422 })
  }
  const dup = await db.user.findFirst({ where: { email, NOT: { id } } })
  if (dup) return NextResponse.json({ success: false, message: 'Email sudah dipakai' }, { status: 422 })

  await db.user.update({ where: { id }, data: { name, email, role: role as (typeof ROLES)[number], status: status as 'active' | 'inactive' } })
  return NextResponse.json({ success: true, message: 'User berhasil diperbarui' })
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await authOr401()
  if (error || !user) return error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, message: 'Parameter id wajib' }, { status: 400 })
  if (id === user.id) {
    return NextResponse.json({ success: false, message: 'Tidak dapat menghapus akun sendiri' }, { status: 422 })
  }
  await db.user.delete({ where: { id } })
  return NextResponse.json({ success: true, message: 'User berhasil dihapus' })
}
