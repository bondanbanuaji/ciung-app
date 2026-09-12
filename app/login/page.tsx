import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LoginForm } from '@/components/forms/login-form'
import { StoreLogo } from '@/components/brand/store-logo'

function CharacterEyes() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
        <span className="h-2 w-2 rounded-full bg-[#111827]" />
      </span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
        <span className="h-2 w-2 rounded-full bg-[#111827]" />
      </span>
    </div>
  )
}

function CharacterSmile() {
  return (
    <svg width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true">
      <path
        d="M5 4 Q17 14 29 4"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BrandShapes() {
  return (
    <div className="relative h-[340px] w-[320px] sm:h-[360px] sm:w-[360px]">
      {/* Purple rectangle character */}
      <div className="animate-float absolute left-0 top-8 flex h-40 w-32 flex-col items-center justify-center gap-2 rounded-2xl bg-[#8B5CF6] shadow-2xl">
        <CharacterEyes />
        <CharacterSmile />
      </div>

      {/* Black rounded rectangle character */}
      <div className="animate-float-delayed absolute right-0 top-0 flex h-44 w-36 flex-col items-center justify-center gap-2 rounded-[28px] bg-[#111827] shadow-2xl">
        <CharacterEyes />
        <CharacterSmile />
      </div>

      {/* Orange semicircle character */}
      <div className="animate-float-delayed absolute bottom-4 left-2 flex h-20 w-40 flex-col items-center justify-end gap-1 rounded-t-full bg-[#F97316] pb-3 pt-6 shadow-xl">
        <CharacterEyes />
      </div>

      {/* Yellow organic blob character */}
      <div
        className="animate-float absolute bottom-0 right-2 flex h-36 w-36 flex-col items-center justify-center gap-2 shadow-xl"
        style={{
          background: '#FACC15',
          borderRadius: '58% 42% 55% 45% / 45% 55% 42% 58%',
        }}
      >
        <CharacterEyes />
        <CharacterSmile />
      </div>
    </div>
  )
}

export default async function Page() {
  const session = await getSession()
  if (session) redirect('/dashboard')
  return (
    <div className="font-satoshi flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Visual branding */}
      <section className="relative flex h-[400px] items-center justify-center overflow-hidden bg-[#F3F4F6] lg:h-auto lg:min-h-screen lg:w-1/2">
        <div className="absolute left-6 top-6 flex items-center gap-3 lg:left-10 lg:top-10">
          <StoreLogo size={40} showName={false} />
          <span className="text-lg font-bold tracking-tight text-[#111827]">Ciung Warna</span>
        </div>
        <BrandShapes />
        <p className="absolute bottom-6 px-6 text-center text-sm font-medium text-slate-500 lg:bottom-10">
          Kelola inventory dengan cepat dan rapi.
        </p>
      </section>

      {/* Auth form */}
      <section className="flex flex-1 items-center justify-center bg-white px-8 py-10 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-[448px]">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-[#111827]">
              Selamat datang
            </h1>
            <p className="mt-3 text-[15px] font-normal text-slate-500">
              Masuk untuk melanjutkan ke Ciung Warna
            </p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
