'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth/session'

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { success: false, message: 'Email dan password wajib diisi' }

  const user = await db.user.findUnique({ where: { email } })
  if (!user || user.status !== 'active') {
    return { success: false, message: 'Email atau password salah.' }
  }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return { success: false, message: 'Email atau password salah.' }

  await createSession(user.id)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
