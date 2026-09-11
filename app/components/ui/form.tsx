import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TextField({ label, error, children, className }: { label?: string; error?: string; children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1', className)}>{label && <label className="text-sm font-medium text-foreground">{label}</label>}{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>
}
export function Select({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-primary', className)} {...props}>{children}</select>
}
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-primary', className)} {...props} />
}
