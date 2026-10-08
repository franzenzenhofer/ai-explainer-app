// Your text at the top of the Tokens slide: shown as plain text or edited in place, with the buttons
// to edit it and to try a hard sample.
import { ArrowDown } from 'lucide-react'
import { useActionHalo } from '../../core/hooks/useHalo'
import { useAppStore } from '../../store/appStore'
import { Button } from '../../core/components/Button'
import { PromptEditor } from './PromptEditor'

export type TextPanel = 'none' | 'edit' | 'samples'

interface TextRowProps {
  panel: TextPanel
  onToggle: (panel: TextPanel) => void
}

export function TextRow({ panel, onToggle }: TextRowProps) {
  const inputText = useAppStore((s) => s.inputText)
  const halo = useActionHalo('tokens')
  const edit = () => {
    halo.used()
    onToggle('edit')
  }
  return (
    <div className="flex items-start gap-2" data-primary-control>
      <div className="min-w-0 flex-1">
        {panel === 'edit' ? (
          <PromptEditor onDone={() => onToggle('none')} />
        ) : (
          <p className="m-0 max-h-[5.25rem] overflow-y-auto whitespace-pre-wrap rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-2 text-lg leading-snug text-slate-700">
            <span className="mr-2 whitespace-nowrap font-semibold text-slate-500">Your text:</span>
            <span className="[overflow-wrap:anywhere]">{inputText}</span>
          </p>
        )}
      </div>
      <Button variant="primary" className={halo.className} aria-expanded={panel === 'edit'} onClick={edit}>
        {panel === 'edit' ? 'Done editing' : 'Edit text'}
      </Button>
      <Button aria-expanded={panel === 'samples'} onClick={() => onToggle('samples')}>
        Try a hard one
      </Button>
    </div>
  )
}

export function SplitArrow({ count, onReplay }: { count: number; onReplay: () => void }) {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--concept-strong)' }}>
      <ArrowDown aria-hidden="true" size={22} />
      <span>cut into {count} {count === 1 ? 'token' : 'tokens'}, each with its ID</span>
      <button type="button" onClick={onReplay} className="ml-auto inline-flex min-h-11 items-center rounded-lg px-3 text-base font-semibold underline underline-offset-4 hover:bg-[var(--concept-tint)]">
        Split again
      </button>
    </div>
  )
}
