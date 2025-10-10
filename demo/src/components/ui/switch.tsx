import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Switch({ className, checked, ...props }: SwitchProps) {
  return (
    <label className={cn('relative inline-flex cursor-pointer items-center', className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} {...props} />
      <span
        className={cn(
          'h-6 w-11 rounded-full border border-slate-300 bg-slate-200 transition-colors peer-checked:border-sky-400 peer-checked:bg-sky-500 dark:border-slate-700 dark:bg-slate-700',
        )}
      />
      <span
        className="absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-[20px] peer-checked:bg-white dark:bg-slate-300"
      />
    </label>
  )
}
