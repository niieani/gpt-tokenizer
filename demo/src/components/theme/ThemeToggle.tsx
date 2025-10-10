import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-600/60 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label="Toggle theme"
    >
      <span aria-hidden>{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Dark' : 'Light'} mode</span>
    </button>
  )
}
