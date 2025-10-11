import { useMemo, useState } from 'react'
import type { ModelSpec } from 'gpt-tokenizer/modelTypes'

import { analysePrompt } from '../../hooks/useTokenAnalysis'
import { formatNumber } from '../../lib/utils'
import { TokenInput } from '../tokenizer/TokenInput'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import type { TokenizerModule } from '../../hooks/useTokenizer'

interface TokenizationPrimerProps {
  modelName: string
  tokenizer: TokenizerModule | null
  tokenizerReady: boolean
  isLoading: boolean
  modelSpec: ModelSpec | undefined
}

const INITIAL_SAMPLE =
  'Tokenization turns text into small pieces called tokens. Models read those tokens to understand and predict what comes next.'

export function TokenizationPrimer({
  modelName,
  tokenizer,
  tokenizerReady,
  isLoading,
  modelSpec,
}: TokenizationPrimerProps) {
  const [sampleText, setSampleText] = useState(INITIAL_SAMPLE)

  const tokenDetails = useMemo(() => {
    if (!tokenizer || !tokenizerReady) {
      return { segments: [], tokenCount: 0, error: null as string | null }
    }

    try {
      const { tokens, segments } = analysePrompt(tokenizer, sampleText)
      return {
        segments,
        tokenCount: tokens.length,
        error: null as string | null,
      }
    } catch (analysisError) {
      console.error('Primer tokenization failed', analysisError)
      return {
        segments: [],
        tokenCount: 0,
        error:
          'We could not tokenize this text. Try editing it or switch models.',
      }
    }
  }, [sampleText, tokenizer, tokenizerReady])

  const contextWindowDisplay = modelSpec?.context_window
    ? `${formatNumber(modelSpec.context_window, 0)} tokens`
    : null

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle>What is tokenization?</CardTitle>
        <CardDescription>
          Large language models do not see words directly — they read tokens.
          Try a short experiment with the active model to see how the pieces
          line up.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <div className="space-y-3 text-md leading-relaxed text-slate-600 dark:text-slate-200">
          <p>
            Tokenization breaks text into tiny chunks called{' '}
            <strong>tokens</strong>. A token might be a whole word, part of a
            word, or even punctuation. The exact split depends on the tokenizer
            your model uses.
          </p>
          <p>
            Language models process tokens in sequence. They guess the next
            token, one piece at a time, using everything they have already seen.
            {contextWindowDisplay ? (
              <span>
                {' '}
                {modelName} can keep about{' '}
                <strong>{contextWindowDisplay}</strong> in its short-term memory
                before it needs to drop or summarize earlier tokens.
              </span>
            ) : null}
          </p>
          <ul className="space-y-2 rounded-2xl border border-slate-200/70 bg-white/95 p-4 text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-200">
            <li>
              <strong>1. Start with text.</strong> Write anything: a question,
              code, or instructions.
            </li>
            <li>
              <strong>2. Split it into tokens.</strong> Each token gets an ID.
              You can show those IDs with the toggle above the playground.
            </li>
            <li>
              <strong>3. Count the tokens.</strong> Pricing and context limits
              are measured in tokens, so shorter tokens mean cheaper, faster
              prompts.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Try it with {modelName}
          </p>
          <p className="mt-1 text-md text-slate-600 dark:text-slate-200">
            Edit the text below to see how the tokenizer slices it. The
            highlighted chips match the tokens the model receives.
          </p>
          <div className="mt-4">
            <TokenInput
              value={sampleText}
              onChange={setSampleText}
              segments={tokenDetails.segments}
              showTokenIds={true}
              disabled={!tokenizerReady}
              isLoading={isLoading}
              ariaLabel="Tokenization primer input"
              minHeight={200}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Token count:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {tokenDetails.tokenCount}
              </strong>
            </span>
            <span>
              {tokenizerReady
                ? 'Live tokenizer view'
                : `Loading tokenizer for ${modelName}…`}
            </span>
          </div>
          {tokenDetails.error && (
            <p className="mt-2 rounded-xl bg-rose-100/80 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">
              {tokenDetails.error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
