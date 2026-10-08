// The stack of blocks, drawn bottom-up: token + position at the bottom, the last block on top.
// Each row is a button that jumps to the vector after that block.
import { MODEL_SPECS } from '../../core/types'
import { cn } from '../../core/utils/cn'

interface LayerStackProps {
  selectedBlock: number
  onSelect: (block: number) => void
}

export function blockLabel(block: number): string {
  return block === 0 ? 'Token + position' : `Block ${block}: attention + feed-forward`
}

export function LayerStack({ selectedBlock, onSelect }: LayerStackProps) {
  const blocks = Array.from({ length: MODEL_SPECS.layers + 1 }, (_, block) => block).reverse()
  return (
    <ol
      aria-label={`The ${MODEL_SPECS.layers} blocks of ${MODEL_SPECS.modelName}, bottom to top`}
      className="m-0 flex list-none flex-col gap-1 p-0"
    >
      {blocks.map((block) => {
        const selected = block === selectedBlock
        const passed = block < selectedBlock
        return (
          <li key={block}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(block)}
              className={cn(
                'flex min-h-11 w-full items-center border-l-4 px-3 text-left text-base transition-colors',
                selected && 'tint-accent border-accent font-semibold text-ink',
                !selected && passed && 'border-ink bg-wash text-ink',
                !selected && !passed && 'border-rule bg-paper text-ink-2 hover:bg-wash',
              )}
            >
              {blockLabel(block)}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
