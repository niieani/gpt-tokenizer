import type { ChatMessage, ChatMessageWithId, TokenSegment } from '../../types'
import { formatNumber } from '../../lib/utils'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { TokenInput } from '../tokenizer/TokenInput'

interface ChatMessageCardProps {
  message: ChatMessageWithId
  onChange: (id: string, partial: Partial<ChatMessage>) => void
  onRemove: (id: string) => void
  tokenCount: number
  segments: TokenSegment[]
  showTokenIds: boolean
  disabled?: boolean
}

export function ChatMessageCard({
  message,
  onChange,
  onRemove,
  tokenCount,
  segments,
  showTokenIds,
  disabled = false,
}: ChatMessageCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor={`role-${message.id}`} className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Role
          </Label>
          <Select
            id={`role-${message.id}`}
            value={message.role ?? 'user'}
            onChange={(event) => onChange(message.id, { role: event.target.value as ChatMessage['role'] })}
            disabled={disabled}
          >
            <option value="system">system</option>
            <option value="user">user</option>
            <option value="assistant">assistant</option>
          </Select>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Tokens: {formatNumber(tokenCount, 0)}</span>
          <button
            type="button"
            onClick={() => onRemove(message.id)}
            className="text-slate-500 transition-colors hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-300"
            aria-label="Remove message"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="mt-3">
        <TokenInput
          value={message.content}
          onChange={(value) => onChange(message.id, { content: value })}
          segments={segments}
          showTokenIds={showTokenIds}
          disabled={disabled}
          minHeight={160}
          placeholder={`Compose a ${message.role ?? 'user'} message…`}
          ariaLabel={`${message.role ?? 'user'} message input`}
        />
      </div>
    </div>
  )
}
