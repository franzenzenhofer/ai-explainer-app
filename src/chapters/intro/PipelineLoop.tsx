// The pipeline drawn large for the intro: the first five stages left to right, the last four right to
// left underneath (a snake), and an arrow from Append back to Text. Cards fade in one after the other.
import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BarChart3, Cpu, Dices, Eye, Hash, Layers, Puzzle, Repeat, Type, type LucideIcon } from 'lucide-react'
import { CONCEPT_COLORS, type StageId } from '../../core/colors'
import { PIPELINE, getChapter, type PipelineStage } from '../../core/chapters'
import { ChapterLink } from '../../core/navigation/ChapterLink'

const ICONS: Record<StageId, LucideIcon> = {
  text: Type,
  tokens: Puzzle,
  numbers: Hash,
  attention: Eye,
  feedforward: Cpu,
  layers: Layers,
  scores: BarChart3,
  pick: Dices,
  append: Repeat,
}

const FIRST_ROW = 5
const CARD_DELAY_S = 0.12

type Direction = 'right' | 'down' | 'left' | 'up'

const ARROWS: Record<Direction, { Icon: LucideIcon; place: string }> = {
  right: { Icon: ArrowRight, place: 'right-[-1.4rem] top-1/2 -translate-y-1/2' },
  left: { Icon: ArrowLeft, place: 'left-[-1.4rem] top-1/2 -translate-y-1/2' },
  down: { Icon: ArrowDown, place: 'bottom-[-1.6rem] left-1/2 -translate-x-1/2' },
  up: { Icon: ArrowUp, place: 'top-[-1.6rem] left-1/2 -translate-x-1/2' },
}

// Where the arrow out of each stage points: along the top row, down, back along the bottom row.
function directionOf(index: number): Direction | null {
  if (index < FIRST_ROW - 1) return 'right'
  if (index === FIRST_ROW - 1) return 'down'
  return 'left'
}

function FlowArrow({ direction, color }: { direction: Direction; color: string }) {
  const { Icon, place } = ARROWS[direction]
  return (
    <span aria-hidden="true" className={`absolute z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow ${place}`} style={{ background: color }}>
      <Icon size={16} strokeWidth={3} />
    </span>
  )
}

function StageCard({ stage, index }: { stage: PipelineStage; index: number }) {
  const color = CONCEPT_COLORS[stage.id]
  const Icon = ICONS[stage.id]
  const direction = directionOf(index)
  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * CARD_DELAY_S, duration: 0.35 }}
      className="relative"
      style={{ '--o': index } as CSSProperties}
    >
      {direction && <FlowArrow direction={direction} color={color.solid} />}
      <ChapterLink
        chapter={getChapter(stage.chapter)}
        className="flex h-full flex-col gap-1 rounded-2xl border-2 bg-paper p-3 no-underline shadow-sm transition-transform hover:-translate-y-0.5"
        style={{ borderColor: color.solid, background: `linear-gradient(180deg, ${color.tint}, #ffffff)` }}
      >
        <span className="flex items-center gap-2 text-lg font-bold" style={{ color: color.strong }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: color.solid }}>
            <Icon aria-hidden="true" size={18} />
          </span>
          {index + 1}. {stage.label}
        </span>
        <span className="text-base leading-snug text-ink">{stage.sentence}</span>
      </ChapterLink>
    </motion.li>
  )
}

export function PipelineLoop() {
  const first = PIPELINE.slice(0, FIRST_ROW)
  const second = PIPELINE.slice(FIRST_ROW)
  const loop = CONCEPT_COLORS.append
  return (
    <div className="relative mx-auto flex w-full max-w-[1180px] flex-col gap-6" aria-label="The pipeline, from text to the appended token and back">
      <ol className="intro-row m-0 grid list-none grid-cols-5 gap-4 p-0">
        {first.map((stage, index) => <StageCard key={stage.id} stage={stage} index={index} />)}
      </ol>
      <ol className="intro-row m-0 grid list-none grid-cols-5 gap-4 p-0">
        <motion.li
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: PIPELINE.length * CARD_DELAY_S + 0.2 }}
          className="relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed p-3 text-center"
          style={{ borderColor: loop.solid, color: loop.strong, '--o': PIPELINE.length } as CSSProperties}
        >
          <FlowArrow direction="up" color={loop.solid} />
          <Repeat aria-hidden="true" size={28} />
          <span className="text-lg font-bold">And again</span>
          <span className="text-base text-ink">The longer text goes back to stage 1, once per new token.</span>
        </motion.li>
        {[...second].reverse().map((stage) => (
          <StageCard key={stage.id} stage={stage} index={PIPELINE.indexOf(stage)} />
        ))}
      </ol>
    </div>
  )
}
