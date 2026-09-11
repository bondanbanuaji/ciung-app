import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-primary text-primary-foreground shadow-[var(--shadow-elevation-1)] hover:shadow-[var(--shadow-elevation-2)]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-[var(--shadow-border)] hover:bg-s-muted',
    ghost: 'hover:bg-s-muted',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  }
  const sizes = { default: 'h-10 px-4 py-2', sm: 'h-9 px-3 rounded-md', lg: 'h-11 px-8', icon: 'h-10 w-10' }
  return <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props} />
}
