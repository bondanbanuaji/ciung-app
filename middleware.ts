import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const protectedPrefixes = ['/dashboard']
const authPages = ['/login', '/register', '/auth/login', '/auth/register']

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const secret = process.env.AUTH_SECRET
  if (!secret) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('session')?.value
  const ok = await hasValidSession(token)

  const isProtected = protectedPrefixes.some((p) => path === p || path.startsWith(p + '/'))
  if (isProtected && !ok) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('session')
    return res
  }

  if (authPages.includes(path) && ok) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
