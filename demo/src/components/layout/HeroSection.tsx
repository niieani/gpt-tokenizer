import { ThemeToggle } from '../theme/ThemeToggle'

export function HeroSection() {
  return (
    <header className="flex flex-col gap-2 rounded-3xl border border-slate-200/70 bg-white/95 px-8 py-10 shadow-lg backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/75">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            gpt-tokenizer playground
          </h1>
          <iframe
            title="Star gpt-tokenizer on GitHub"
            src="https://ghbtns.com/github-btn.html?user=niieani&repo=gpt-tokenizer&type=star&count=true&size=large"
            width="150"
            height="30"
            frameBorder="0"
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
        <div className="flex w-full max-w-md flex-col gap-4 md:items-end">
          <div className="grid w-full gap-3">
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
            <a
              href="https://www.npmjs.com/package/gpt-tokenizer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center sm:justify-end"
            >
              <img
                alt="npm version"
                className="h-8"
                src="https://img.shields.io/npm/v/gpt-tokenizer.svg?color=0ea5e9&label=gpt-tokenizer"
              />
            </a>
            <a
              href="https://github.com/sponsors/niieani?o=esb"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-pink-400/60 bg-pink-100/70 px-3 py-2 text-sm font-semibold text-pink-700 transition-colors hover:bg-pink-200/80 dark:border-pink-400/60 dark:bg-pink-600/75 dark:text-pink-50 dark:hover:bg-pink-600/85"
            >
              🩷 Sponsor @niieani
            </a>
          </div>
        </div>
      </div>
      <p className="text-lg text-slate-600 dark:text-slate-300">
        Try out the demo of the fastest, smallest and lowest footprint GPT
        tokenizer available for all JS environments. Instant token highlighting,
        live pricing estimates and chat-aware encoding — all powered by the{' '}
        <a
          href="https://www.npmjs.com/package/gpt-tokenizer"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-600 underline decoration-sky-400/70 underline-offset-2 transition-colors hover:text-sky-700 hover:decoration-sky-500 dark:text-sky-400 dark:decoration-sky-500/70 dark:hover:text-sky-300"
        >
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-700 dark:bg-slate-900/70 dark:text-sky-200">
            gpt-tokenizer
          </code>
        </a>{' '}
        package.
      </p>
    </header>
  )
}
