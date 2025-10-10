import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:ring-offset-slate-950',
        className,
      )}
      {...props}
    />
  )
}
