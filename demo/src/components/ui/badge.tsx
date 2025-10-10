import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-slate-300/80 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-100',
        className,
      )}
      {...props}
    />
  )
}
