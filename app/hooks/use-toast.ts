'use client'

import { useToast as useToastStore } from '@/store/toast'

export function useToast() {
  return useToastStore()
}
