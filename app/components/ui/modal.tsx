import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title: string
}

export function Modal({ open, onOpenChange, children, title }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-md rounded-lg bg-card shadow-[var(--shadow-elevation-5)] p-6">
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        <div className="mt-4">{children}</div>
        <button onClick={() => onOpenChange(false)} className="mt-4 text-sm text-muted-foreground hover:text-foreground">Tutup</button>
      </div>
    </div>
  )
}
