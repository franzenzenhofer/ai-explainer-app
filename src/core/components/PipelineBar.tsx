// The pipeline on every slide: nine stages in their concept colours, the current one filled.
// It is the "you are here" and the colour legend in one; every stage links to its slide.
import { CONCEPT_COLORS, type StageId } from '../colors'
import { PIPELINE, getChapter } from '../chapters'
import { ChapterLink } from '../navigation/ChapterLink'
import { cn } from '../utils/cn'

interface PipelineBarProps {
  // The stage of the current slide; null lights the whole machine.
  current: StageId | null
}

const ARROW = '›'

export function PipelineBar({ current }: PipelineBarProps) {
  return (
    <nav aria-label="Pipeline" className="min-w-0 flex-1">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-0.5 gap-y-1 p-0">
        {PIPELINE.map((stage, index) => {
          const color = CONCEPT_COLORS[stage.id]
          const active = current === stage.id || (current === 'tokens' && stage.id === 'text')
          const whole = current === null
          return (
            <li key={stage.id} className="flex items-center">
              {index > 0 && <span aria-hidden="true" className="px-0.5 text-lg text-ink-3">{ARROW}</span>}
              <ChapterLink
                chapter={getChapter(stage.chapter)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border-2 px-3 text-base font-semibold no-underline transition-colors',
                  active && 'shadow-sm',
                )}
                style={{
                  background: active ? color.solid : whole ? color.tint : '#ffffff',
                  borderColor: active || whole ? color.solid : color.soft,
                  color: active ? '#ffffff' : color.strong,
                }}
              >
                {stage.label}
              </ChapterLink>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
