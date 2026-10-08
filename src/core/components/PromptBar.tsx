// The shared prompt as one line in the top bar; tap to edit, Enter or leaving the field saves.
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'

export function PromptBar() {
  const inputText = useAppStore((s) => s.inputText)
  const setInputText = useAppStore((s) => s.setInputText)
  const [draft, setDraft] = useState<string | null>(null)

  const save = () => {
    if (draft !== null && draft.trim() && draft !== inputText) setInputText(draft)
    setDraft(null)
  }

  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(inputText)}
        className="flex min-h-11 w-full min-w-0 items-center gap-3 rounded-[3px] border border-rule px-3 text-left text-base hover:border-rule-strong"
        aria-label={`Your text: ${inputText}. Edit`}
      >
        <span className="min-w-0 flex-1 truncate text-ink">{inputText}</span>
        <span className="shrink-0 font-semibold text-ink-2 underline underline-offset-4">Edit</span>
      </button>
    )
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); save() }} className="flex min-w-0 gap-2">
      <label htmlFor="prompt-bar" className="sr-only">Your text</label>
      <input
        id="prompt-bar"
        value={draft}
        autoFocus
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => save()}
        onKeyDown={(event) => event.key === 'Escape' && setDraft(null)}
        className="min-h-11 min-w-0 flex-1 rounded-[3px] border-2 border-ink px-3 text-base text-ink"
      />
      <button type="submit" className="min-h-11 rounded-[3px] bg-ink px-4 text-base font-semibold text-paper">Save</button>
    </form>
  )
}
