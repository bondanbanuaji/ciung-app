'use client'

import { useState } from 'react'

export function usePagination(totalItems: number, perPage = 10) {
  const [page, setPage] = useState(1)
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const safePage = Math.min(Math.max(1, page), lastPage)
  return {
    page: safePage,
    lastPage,
    perPage,
    next: () => setPage((p) => Math.min(p + 1, lastPage)),
    prev: () => setPage((p) => Math.max(p - 1, 1)),
    goTo: (p: number) => setPage(Math.min(Math.max(1, p), lastPage)),
  }
}
