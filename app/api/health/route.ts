import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Dipakai cron keep-alive (GitHub Actions / cron-job.org) agar project
// Supabase free tidak dianggap nganggur lalu di-pause. Tanpa auth by design.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, time: new Date().toISOString() })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
