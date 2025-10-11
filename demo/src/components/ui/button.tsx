import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const baseStyles =
  'inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  default:
    'bg-sky-500 text-white hover:bg-sky-600 shadow-sm dark:bg-sky-500 dark:hover:bg-sky-400',
  subtle:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800/80',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}

export default Button
