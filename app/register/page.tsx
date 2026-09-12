import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { StoreLogo } from '@/components/brand/store-logo'

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-card p-8 shadow-[var(--shadow-elevation-3)] text-center">
          <StoreLogo size={72} showName={false} />
          <h1 className="font-display mt-4 text-2xl font-semibold text-foreground">Daftar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registrasi mandiri tidak tersedia (hanya login via akun yang sudah dibuat admin).
          </p>
          <Link href="/login" className="mt-6 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}
