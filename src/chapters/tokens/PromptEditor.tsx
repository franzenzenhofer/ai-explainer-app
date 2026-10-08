// The prompt editor on the Tokens chapter: one textarea, saved to the store as you type.
import { useAppStore } from '../../store/appStore'

interface PromptEditorProps {
  onDone: () => void
}

export function PromptEditor({ onDone }: PromptEditorProps) {
  const inputText = useAppStore((s) => s.inputText)
  const setInputText = useAppStore((s) => s.setInputText)
  return (
    <div>
      <label htmlFor="prompt-editor" className="mb-2 block text-base font-semibold">Your text</label>
      <textarea
        id="prompt-editor"
        value={inputText}
        autoFocus
        rows={3}
        onChange={(event) => setInputText(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onDone()}
        className="block w-full resize-y rounded-[3px] border-2 border-ink p-3 text-xl leading-snug text-ink"
      />
    </div>
  )
}
