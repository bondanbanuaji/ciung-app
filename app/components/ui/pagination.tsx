'use client'

import { Button } from './button'

interface Props {
  page: number
  lastPage: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, lastPage, total, onChange }: Props) {
  if (lastPage <= 1) return null
  const nums: number[] = []
  for (let p = Math.max(1, page - 2); p <= Math.min(lastPage, page + 2); p++) nums.push(p)
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-xs text-muted-foreground">Total {total} data</p>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</Button>
        {nums[0] > 1 && <span className="px-1 text-xs text-muted-foreground">…</span>}
        {nums.map((p) => (
          <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'} onClick={() => onChange(p)}>{p}</Button>
        ))}
        {nums[nums.length - 1] < lastPage && <span className="px-1 text-xs text-muted-foreground">…</span>}
        <Button size="sm" variant="outline" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>›</Button>
      </div>
    </div>
  )
}
