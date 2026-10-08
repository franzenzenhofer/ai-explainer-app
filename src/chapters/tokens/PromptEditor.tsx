// The prompt editor on the Tokens slide: one textarea, saved to the store as you type.
import { useAppStore } from '../../store/appStore'

interface PromptEditorProps {
  onDone: () => void
}

export function PromptEditor({ onDone }: PromptEditorProps) {
  const inputText = useAppStore((s) => s.inputText)
  const setInputText = useAppStore((s) => s.setInputText)
  return (
    <div>
      <label htmlFor="prompt-editor" className="sr-only">Your text</label>
      <textarea
        id="prompt-editor"
        value={inputText}
        autoFocus
        placeholder="Type any text here"
        rows={2}
        onChange={(event) => setInputText(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onDone()}
        className="block w-full resize-none rounded-lg border-2 border-[var(--accent)] bg-paper px-3 py-2 text-lg leading-snug text-ink"
      />
    </div>
  )
}
