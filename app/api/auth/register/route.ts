import { NextResponse } from 'next/server'

// Laravel bawaan tidak punya /register (cek AuthController: hanya login/logout/user).
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Registrasi tidak tersedia di backend (hanya login). Hubungi admin.' },
    { status: 404 }
  )
}
