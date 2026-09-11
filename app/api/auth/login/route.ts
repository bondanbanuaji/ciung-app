import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth/session'
import { toPublicUser } from '@/lib/auth/user'

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Payload tidak valid' }, { status: 400 })
  }
  const email = String(body.email ?? '').trim()
  const password = String(body.password ?? '')
  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email dan password wajib diisi' }, { status: 422 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ success: false, message: 'Email atau password salah.' }, { status: 401 })
  }
  if (user.status !== 'active') {
    return NextResponse.json({ success: false, message: 'Akun nonaktif. Hubungi admin.' }, { status: 403 })
  }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return NextResponse.json({ success: false, message: 'Email atau password salah.' }, { status: 401 })
  }

  await createSession(user.id)
  return NextResponse.json({ success: true, data: { user: toPublicUser(user) } })
}
