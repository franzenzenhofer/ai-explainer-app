// One button per stage of the stack (0 = token + position, 1 to 12 = the blocks), plus Play,
// Block down and Block up.
import { Button } from '../../core/components/Button'
import { useActionHalo } from '../../core/hooks/useHalo'
import { MODEL_SPECS } from '../../core/types'
import { cn } from '../../core/utils/cn'
import { blockLabel } from './LayerStack'

interface BlockPickerProps {
  selectedBlock: number
  onSelect: (block: number) => void
  playing: boolean
  onPlay: () => void
}

export function BlockPicker({ selectedBlock, onSelect, playing, onPlay }: BlockPickerProps) {
  const halo = useActionHalo('layers')
  const play = () => {
    halo.used()
    onPlay()
  }
  const blocks = Array.from({ length: MODEL_SPECS.layers + 1 }, (_, block) => block)
  return (
    <div className="flex flex-col gap-2" data-primary-control>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" className={halo.className} onClick={play}>{playing ? 'Pause' : 'Play: flow up the stack'}</Button>
        <Button onClick={() => onSelect(selectedBlock - 1)} disabled={selectedBlock === 0}>Block down</Button>
        <Button onClick={() => onSelect(selectedBlock + 1)} disabled={selectedBlock === MODEL_SPECS.layers}>Block up</Button>
      </div>
      <ol aria-label={`The ${MODEL_SPECS.layers} blocks of ${MODEL_SPECS.modelName}, bottom to top`} className="m-0 flex list-none flex-wrap gap-1 p-0">
        {blocks.map((block) => (
          <li key={block}>
            <button
              type="button"
              aria-pressed={block === selectedBlock}
              aria-label={blockLabel(block)}
              title={blockLabel(block)}
              onClick={() => onSelect(block)}
              className={cn(
                'min-h-11 w-9 rounded-lg border-2 text-base font-bold tabular-nums transition-colors',
                block === selectedBlock ? 'border-[var(--concept)] bg-[var(--concept)] text-paper' : 'border-[var(--concept-soft)] bg-paper text-[var(--concept-strong)] hover:bg-[var(--concept-tint)]',
              )}
            >
              {block}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
