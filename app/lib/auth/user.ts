import 'server-only'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from './jwt'

export function toPublicUser(u: {
  id: number
  name: string
  username: string
  email: string
  phone: string | null
  role: string
  status: string
  avatar: string | null
}) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    avatar: u.avatar,
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await verifySession(token)
  if (!session) return null
  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (!user || user.status !== 'active') return null
  return toPublicUser(user)
}

/** Untuk Route Handlers: kembalikan user atau null (panggil lalu balas 401). */
export async function requireUser() {
  return getCurrentUser()
}
