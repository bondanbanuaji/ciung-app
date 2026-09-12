import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg bg-card shadow-[var(--shadow-elevation-1)]', className)}>{children}</div>
}
export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>
}
export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('font-display text-lg font-semibold leading-none tracking-tight text-foreground', className)}>{children}</h3>
}
export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}
export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}
export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center p-6 pt-0', className)}>{children}</div>
}
