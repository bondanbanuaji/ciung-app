import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('relative w-full overflow-auto', className)}><table className="w-full caption-bottom text-sm">{children}</table></div>
}
export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="[&_tr]:border-b border-s-muted">{children}</thead>
}
export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="[&_tr]:last:border-b [&_tr:hover]:bg-s-muted/50 transition-colors">{children}</tbody>
}
export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('[&_td]:border-r [&_td]:border-s-muted/50', className)}>{children}</tr>
}
export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn('h-12 px-4 text-left align-middle font-semibold text-muted-foreground [&[align=center]]:text-center', className)}>{children}</th>
}
export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('p-4 align-middle', className)}>{children}</td>
}
