import { NextResponse } from 'next/server'
import { getStoreBranding } from '@/lib/store'

// Branding publik (tanpa auth) agar halaman login/register bisa menampilkan
// logo + nama toko. Hanya field non-sensitif yang diekspos.
export async function GET() {
  const store = await getStoreBranding()
  return NextResponse.json({ success: true, data: store })
}
