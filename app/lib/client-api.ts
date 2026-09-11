'use client'

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null)
  if (!res.ok || (data && data.success === false && res.status >= 400)) {
    throw new Error(data?.message || `Request gagal (${res.status})`)
  }
  return data as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include', headers: { Accept: 'application/json' } })
  return parse<T>(res)
}

export async function apiSend<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parse<T>(res)
}
