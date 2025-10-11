import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_CHAT, DEFAULT_PROMPT } from './constants'
import { ChatPlayground } from './components/chat/ChatPlayground'
import { ModelInsights } from './components/info/ModelInsights'
import { TokenizationPrimer } from './components/info/TokenizationPrimer'
import { HeroSection } from './components/layout/HeroSection'
import { SiteFooter } from './components/layout/SiteFooter'
import { TokenizerPlayground } from './components/tokenizer/TokenizerPlayground'
import { TokenizerControls } from './components/tokenizer/TokenizerControls'
import { useChatAnalysis } from './hooks/useChatAnalysis'
import { useTokenAnalysis } from './hooks/useTokenAnalysis'
import { useTokenizer } from './hooks/useTokenizer'
import { INITIAL_MODEL, MODEL_OPTIONS } from './lib/models'
import type { ChatMessage, ChatMessageWithId } from './types'

export default function App() {
  const [selectedModel, setSelectedModel] = useState(INITIAL_MODEL)
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [showTokenIds, setShowTokenIds] = useState(false)
  const [messages, setMessages] = useState<ChatMessageWithId[]>(DEFAULT_CHAT)
  const [activeTab, setActiveTab] = useState<'prompt' | 'chat'>('prompt')

  const {
    tokenizer,
    isLoading,
    error: tokenizerError,
    modelSpec,
  } = useTokenizer(selectedModel)

  const tokenAnalysis = useTokenAnalysis({
    tokenizer,
    prompt,
    error: tokenizerError,
  })

  const tokensPerHundredChars = useMemo(() => {
    if (!tokenAnalysis.tokens.length || prompt.length === 0) return 0
    return tokenAnalysis.tokens.length / (prompt.length / 100)
  }, [prompt.length, tokenAnalysis.tokens.length])

  const sanitizedChat = useMemo<ChatMessage[]>(
    () =>
      messages
        .map((message) => ({
          role: message.role,
          name: message.name,
          content: message.content.trim(),
        }))
        .filter((message) => message.content.length > 0),
    [messages],
  )

  const chatAnalysis = useChatAnalysis({
    tokenizer,
    messages: sanitizedChat,
    error: tokenizerError,
  })

  const handleMessageChange = useCallback(
    (id: string, partial: Partial<ChatMessage>) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, ...partial } : message,
        ),
      )
    },
    [],
  )

  const handleAddMessage = useCallback(() => {
    setMessages((current) => [
      ...current,
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: '',
      },
    ])
  }, [])

  const handleRemoveMessage = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id))
  }, [])

  const tokenizerReady = Boolean(tokenizer)

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <HeroSection />

      <section className="grid gap-8 xl:grid-cols-[2.1fr_1fr]">
        <div className="flex flex-col gap-2">
          <TokenizerControls
            modelName={selectedModel}
            onModelChange={setSelectedModel}
            modelOptions={MODEL_OPTIONS}
            isLoading={isLoading}
            tokenizerReady={tokenizerReady}
            showTokenIds={showTokenIds}
            onToggleTokenIds={setShowTokenIds}
            loadError={tokenizerError}
          />
          <nav
            className="inline-flex w-full items-center justify-start gap-2 rounded-full border border-slate-200/70 bg-white/95 p-1 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-200"
            role="tablist"
            aria-label="Tokenizer modes"
          >
            <button
              type="button"
              onClick={() => setActiveTab('prompt')}
              role="tab"
              aria-selected={activeTab === 'prompt'}
              className={
                activeTab === 'prompt'
                  ? 'flex-1 rounded-full bg-sky-500/90 px-4 py-2 text-white shadow-sm transition-colors dark:bg-sky-500'
                  : 'flex-1 rounded-full px-4 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }
            >
              Single prompt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              role="tab"
              aria-selected={activeTab === 'chat'}
              className={
                activeTab === 'chat'
                  ? 'flex-1 rounded-full bg-sky-500/90 px-4 py-2 text-white shadow-sm transition-colors dark:bg-sky-500'
                  : 'flex-1 rounded-full px-4 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }
            >
              Chat conversation tokens
            </button>
          </nav>

          {activeTab === 'prompt' ? (
            <TokenizerPlayground
              modelSpec={modelSpec}
              prompt={prompt}
              onPromptChange={setPrompt}
              showTokenIds={showTokenIds}
              tokenAnalysis={tokenAnalysis}
              tokensPerHundredChars={tokensPerHundredChars}
              isLoading={isLoading}
              tokenizerReady={tokenizerReady}
            />
          ) : (
            <ChatPlayground
              messages={messages}
              onMessageChange={handleMessageChange}
              onAddMessage={handleAddMessage}
              onRemoveMessage={handleRemoveMessage}
              tokenizer={tokenizer}
              tokens={chatAnalysis.tokens}
              cost={chatAnalysis.cost}
              sanitizedCount={sanitizedChat.length}
              error={chatAnalysis.error}
              showTokenIds={showTokenIds}
              segments={chatAnalysis.segments}
            />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <ModelInsights modelSpec={modelSpec} />
        </div>
      </section>

      <section>
        <TokenizationPrimer
          modelName={selectedModel}
          tokenizer={tokenizer}
          tokenizerReady={tokenizerReady}
          isLoading={isLoading}
          modelSpec={modelSpec}
        />
      </section>

      <SiteFooter />
    </main>
  )
}
