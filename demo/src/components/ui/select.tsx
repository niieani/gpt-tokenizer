import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, disabled, ...props }, ref) => (
    <div className={cn('relative inline-flex w-full items-center', disabled && 'opacity-60')}>
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-sm text-slate-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:ring-offset-slate-900',
          className,
        )}
        disabled={disabled}
        {...props}
      />
      <svg
        className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </div>
  ),
)

Select.displayName = 'Select'
