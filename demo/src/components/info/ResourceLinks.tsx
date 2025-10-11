import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function ResourceLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Share &amp; learn</CardTitle>
        <CardDescription>
          Resources for diving deeper into tokenization, pricing and the open-source project.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-5">
        <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
          <p>
            • Read the{' '}
            <a
              href="https://github.com/niieani/gpt-tokenizer"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:text-sky-500 dark:text-sky-300 dark:hover:text-sky-200"
            >
              documentation on GitHub
            </a>{' '}
            to understand how the tokenizer works across environments.
          </p>
          <p className="mt-3">
            • Explore the{' '}
            <a
              href="https://github.com/niieani/gpt-tokenizer-demo"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:text-sky-500 dark:text-sky-300 dark:hover:text-sky-200"
            >
              original demo reference
            </a>{' '}
            for additional implementation ideas.
          </p>
          <p className="mt-3">
            • Need precise limits? Use the{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-slate-800/80 dark:text-emerald-200">
              isWithinTokenLimit
            </code>{' '}
            helper exported from any model bundle.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
          <p>
            Every interaction here runs fully client-side thanks to <strong>lazy loaded token bundles</strong>. Swap models as often as you like — token data is streamed straight from the{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-indigo-700 dark:bg-slate-800/80 dark:text-indigo-200">gpt-tokenizer</code> package.
          </p>
          <p className="mt-3">
            Deploy the demo to your own infrastructure by copying the{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-indigo-700 dark:bg-slate-800/80 dark:text-indigo-200">demo</code> folder and running{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-emerald-700 dark:bg-slate-800/80 dark:text-emerald-200">npm install</code>{' '}
            followed by{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-emerald-700 dark:bg-slate-800/80 dark:text-emerald-200">npm run dev</code>.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
