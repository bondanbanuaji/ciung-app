import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
    'bg-primary/10 text-primary': variant === 'default',
    'bg-destructive/10 text-destructive': variant === 'destructive',
    'bg-success/10 text-success': variant === 'success',
    'bg-warning/10 text-warning': variant === 'warning',
    'bg-info/10 text-info': variant === 'info',
  }, className)}>{children}</span>
}
