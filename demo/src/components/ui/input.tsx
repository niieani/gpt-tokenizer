import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
