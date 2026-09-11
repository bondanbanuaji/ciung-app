import { NextRequest, NextResponse } from 'next/server'
import { authOr401 } from '@/lib/api-helpers'
import { getStoreBranding, setStoreBranding } from '@/lib/store'

export async function GET() {
  const { error } = await authOr401()
  if (error) return error
  return NextResponse.json({ success: true, data: await getStoreBranding() })
}

export async function PUT(request: NextRequest) {
  const { user, error } = await authOr401()
  if (error || !user) return error
  if (user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Hanya admin yang dapat mengubah pengaturan sistem' }, { status: 403 })
  }
  const body = (await request.json().catch(() => null)) as {
    name?: unknown; address?: unknown; phone?: unknown; logoPath?: unknown; logo_path?: unknown
  } | null
  if (!body) return NextResponse.json({ success: false, message: 'Payload tidak valid' }, { status: 400 })
  if (body.name !== undefined && !String(body.name).trim()) {
    return NextResponse.json({ success: false, message: 'Nama toko wajib diisi' }, { status: 422 })
  }
  const store = await setStoreBranding({
    ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
    ...(body.address !== undefined ? { address: String(body.address) } : {}),
    ...(body.phone !== undefined ? { phone: String(body.phone) } : {}),
    ...(body.logoPath ?? body.logo_path !== undefined ? { logoPath: String(body.logoPath ?? body.logo_path) } : {}),
  })
  return NextResponse.json({ success: true, message: 'Identitas toko berhasil disimpan', data: store })
}
