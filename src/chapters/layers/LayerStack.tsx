// The stack drawn bottom-up: token + position at the bottom, block 12 on top, each block made of an
// attention part (orange) and a feed-forward part (green). A violet "vector" marker climbs to the block
// the reader is looking at. The buttons to jump to a block are in BlockPicker.
import { motion } from 'motion/react'
import { CONCEPT_COLORS } from '../../core/colors'
import { MODEL_SPECS } from '../../core/types'
import { cn } from '../../core/utils/cn'

export const SLAB_PX = 24
const SLAB_GAP_PX = 2
// Height of the heading line above the slabs (16px text plus its margin).
const HEADING_PX = 28
const LAYERS = CONCEPT_COLORS.layers

export function blockLabel(block: number): string {
  return block === 0 ? 'Token + position' : `Block ${block}: attention + feed-forward`
}

function Slab({ block, selectedBlock }: { block: number; selectedBlock: number }) {
  const selected = block === selectedBlock
  const passed = block < selectedBlock
  return (
    <li
      className={cn('flex items-center justify-between gap-2 rounded-md border-2 px-2 text-base font-semibold leading-none transition-colors duration-300')}
      style={{
        height: SLAB_PX,
        background: selected ? LAYERS.solid : passed ? LAYERS.tint : '#ffffff',
        borderColor: selected || passed ? LAYERS.solid : LAYERS.soft,
        color: selected ? '#ffffff' : LAYERS.strong,
      }}
    >
      <span className="whitespace-nowrap">{block === 0 ? 'Token + position' : `Block ${block}`}</span>
      {block > 0 && (
        <span className="flex gap-1" aria-hidden="true">
          <span className="block h-3 w-5 rounded-sm" style={{ background: CONCEPT_COLORS.attention.solid }} />
          <span className="block h-3 w-5 rounded-sm" style={{ background: CONCEPT_COLORS.feedforward.solid }} />
        </span>
      )}
    </li>
  )
}

export function LayerStack({ selectedBlock }: { selectedBlock: number }) {
  const blocks = Array.from({ length: MODEL_SPECS.layers + 1 }, (_, block) => block).reverse()
  const fromTop = MODEL_SPECS.layers - selectedBlock
  return (
    <div className="relative w-60 shrink-0 pr-20 max-sm:w-auto" aria-hidden="true">
      <p className="m-0 mb-1 whitespace-nowrap text-base font-bold" style={{ color: LAYERS.strong }}>
        {MODEL_SPECS.modelName}: {MODEL_SPECS.layers} blocks
      </p>
      <ol className="m-0 flex list-none flex-col p-0" style={{ gap: SLAB_GAP_PX }}>
        {blocks.map((block) => <Slab key={block} block={block} selectedBlock={selectedBlock} />)}
      </ol>
      <motion.span
        initial={false}
        className="absolute right-0 flex items-center gap-1 rounded-full px-2 text-base font-bold text-paper shadow-md"
        style={{ height: SLAB_PX, background: CONCEPT_COLORS.numbers.solid }}
        animate={{ top: HEADING_PX + fromTop * (SLAB_PX + SLAB_GAP_PX) }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        {'←'} vector
      </motion.span>
    </div>
  )
}
