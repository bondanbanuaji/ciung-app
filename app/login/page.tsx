import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LoginForm } from '@/components/forms/login-form'

export default async function Page() {
  const session = await getSession()
  if (session) redirect('/dashboard')
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-card p-8 shadow-[var(--shadow-elevation-3)]">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">CW</div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">Ciung Warna</h1>
            <p className="mt-1 text-sm text-muted-foreground">Masuk untuk melanjutkan</p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
