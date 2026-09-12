'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/store/auth'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      router.replace(searchParams.get('from') || '/dashboard')
      router.refresh()
    } else {
      setError(result.message || 'Login gagal')
    }
  }

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="space-y-8">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Email — animated underline input */}
      <div className="group relative">
        <label
          htmlFor="login-email"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Email
        </label>
        <input
          id="login-email"
          name="login-email"
          type="email"
          required
          spellCheck={false}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email"
          aria-label="Email"
          className="w-full border-b-2 border-input bg-transparent pb-2 pt-1.5 text-[15px] text-foreground transition-colors focus:border-primary focus:outline-none placeholder:text-muted-foreground/50"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-[width] duration-300 ease-out group-focus-within:w-full"
        />
      </div>

      {/* Password — animated underline input + eye toggle */}
      <div className="group relative">
        <label
          htmlFor="login-password"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="login-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            aria-label="Password"
            className="w-full border-b-2 border-input bg-transparent pb-2 pl-0 pr-10 pt-1.5 text-[15px] text-foreground transition-colors focus:border-primary focus:outline-none placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            aria-pressed={showPassword}
            className="absolute bottom-1 right-0 flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-[width] duration-300 ease-out group-focus-within:w-full"
        />
      </div>

      {/* Remember me + forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer select-none items-center gap-2.5">
          <input
            type="checkbox"
            className="sr-only"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span
            aria-hidden="true"
            className={`flex h-5 w-5 items-center justify-center rounded-[6px] border-2 transition-colors duration-200 ${
              rememberMe ? 'border-primary bg-primary' : 'border-input bg-surface'
            }`}
          >
            <Check
              strokeWidth={3}
              className={`h-3.5 w-3.5 text-primary-foreground transition-transform duration-200 ${
                rememberMe ? 'scale-100' : 'scale-0'
              }`}
            />
          </span>
          <span className="text-sm font-medium text-muted-foreground">Ingat saya</span>
        </label>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Lupa password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elevation-1)] transition duration-150 hover:bg-primary-hover hover:shadow-[var(--shadow-elevation-2)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Masuk...' : 'Masuk'}
      </button>

      <p className="text-center text-base text-muted-foreground">
        Butuh akun akses?{' '}
        <a href="https://wa.me/628978601538" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">
          Hubungi admin
        </a>
      </p>
    </form>
  )
}
