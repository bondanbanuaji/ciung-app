import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LoginForm } from '@/components/forms/login-form'
import { StoreLogo } from '@/components/brand/store-logo'

export default async function Page() {
  const session = await getSession()
  if (session) redirect('/dashboard')
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-card p-8 shadow-[var(--shadow-elevation-3)]">
          <div className="mb-6 text-center">
            <StoreLogo size={72} />
            <p className="mt-3 text-sm text-muted-foreground">Masuk untuk melanjutkan</p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
