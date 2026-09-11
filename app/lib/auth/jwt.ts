import { SignJWT, jwtVerify } from 'jose'

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 hari (detik)

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET belum diset. Isi di .env / Environment Variables Vercel.')
  }
  return new TextEncoder().encode(secret)
}

export async function signSession(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySession(token: string): Promise<{ userId: number; expiresAt: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const userId = Number(payload.sub)
    if (!Number.isFinite(userId)) return null
    const expiresAt =
      typeof payload.exp === 'number' ? new Date(payload.exp * 1000).toISOString() : ''
    return { userId, expiresAt }
  } catch {
    return null
  }
}

export const SESSION_COOKIE = 'session'
export const SESSION_MAX_AGE = COOKIE_MAX_AGE
