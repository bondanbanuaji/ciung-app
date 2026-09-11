import { NextResponse } from 'next/server'
import { requireUser, toPublicUser } from '@/lib/auth/user'

export async function GET() {
  const user = await requireUser()
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ success: true, data: { user: toPublicUser(user) } })
}
