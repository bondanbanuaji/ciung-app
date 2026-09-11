import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { authOr401 } from '@/lib/api-helpers'
import { toPublicUser } from '@/lib/auth/user'

export async function GET() {
  const { user, error } = await authOr401()
  if (error || !user) return error
  const full = await db.user.findUnique({ where: { id: user.id } })
  if (!full) return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ success: true, data: { user: toPublicUser(full) } })
}

export async function PUT(request: NextRequest) {
  const { user, error } = await authOr401()
  if (error || !user) return error
  const body = (await request.json().catch(() => null)) as {
    name?: unknown; email?: unknown; current_password?: unknown; password?: unknown; password_confirmation?: unknown
  } | null
  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  if (!name || !email) {
    return NextResponse.json({ success: false, message: 'Nama dan email wajib diisi' }, { status: 422 })
  }
  const dup = await db.user.findFirst({ where: { email, NOT: { id: user.id } } })
  if (dup) return NextResponse.json({ success: false, message: 'Email sudah dipakai' }, { status: 422 })

  const data: { name: string; email: string; password?: string } = { name, email }
  const newPassword = body?.password != null ? String(body.password) : ''
  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'Password minimal 8 karakter' }, { status: 422 })
    }
    if (newPassword !== String(body?.password_confirmation ?? '')) {
      return NextResponse.json({ success: false, message: 'Konfirmasi password tidak cocok' }, { status: 422 })
    }
    const current = await db.user.findUnique({ where: { id: user.id } })
    if (!current || !(await bcrypt.compare(String(body?.current_password ?? ''), current.password))) {
      return NextResponse.json(
        { success: false, message: 'Password lama salah', errors: { current_password: ['Password lama salah'] } },
        { status: 422 }
      )
    }
    data.password = await bcrypt.hash(newPassword, 10)
  }

  await db.user.update({ where: { id: user.id }, data })
  return NextResponse.json({ success: true, message: 'Profile berhasil diperbarui' })
}
