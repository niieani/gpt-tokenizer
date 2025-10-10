import { Badge } from '../ui/badge'
import { ThemeToggle } from '../theme/ThemeToggle'

export function HeroSection() {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white/85 px-8 py-10 shadow-lg backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/70">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Badge className="w-fit border-sky-400/40 bg-sky-500/10 text-sky-700 dark:text-sky-200">
            Token playground
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">gpt-tokenizer</h1>
          <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Explore OpenAI-compatible models with instant token highlighting, live pricing estimates and chat-aware encoding —
            all powered by the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-700 dark:bg-slate-800/80 dark:text-sky-200">gpt-tokenizer</code> package.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <ThemeToggle />
          <a
            href="https://github.com/sponsors/niieani?o=esb"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-pink-400/60 bg-pink-100/60 px-4 py-2 text-sm font-semibold text-pink-700 transition-colors hover:bg-pink-200/70 dark:border-pink-500/50 dark:bg-pink-500/15 dark:text-pink-200 dark:hover:bg-pink-500/25"
          >
            🩷 Sponsor @niieani
          </a>
          <iframe
            title="Star gpt-tokenizer on GitHub"
            src="https://ghbtns.com/github-btn.html?user=niieani&repo=gpt-tokenizer&type=star&count=true&size=large"
            width="170"
            height="30"
            className="rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900"
          />
          <a
            href="https://www.npmjs.com/package/gpt-tokenizer"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center"
          >
            <img
              alt="npm version"
              className="h-8"
              src="https://img.shields.io/npm/v/gpt-tokenizer.svg?color=0ea5e9&label=gpt-tokenizer"
            />
          </a>
        </div>
      </div>
    </header>
  )
}
