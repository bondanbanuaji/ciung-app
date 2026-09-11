'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { beginLoading } from '@/store/loading'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/user', { credentials: 'include', headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('unauthorized')
      const data = await res.json()
      const u = data?.data?.user ?? null
      if (u) {
        setUser(u)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const done = beginLoading()
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.success) {
        await fetchUser()
        return { success: true }
      }
      return { success: false, message: data?.message || 'Login gagal' }
    } finally {
      done()
    }
  }, [fetchUser])

  const logout = useCallback(async () => {
    const done = beginLoading()
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    setUser(null)
    setIsAuthenticated(false)
    done()
  }, [])

  // Pulihkan sesi saat refresh halaman (cookie httpOnly masih ada)
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useUser() {
  const { user, isAuthenticated, fetchUser } = useAuth()
  return { user, isAuthenticated, isLoading: false, refetch: fetchUser }
}
