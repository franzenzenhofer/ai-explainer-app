// All 768 numbers of the running vector as bars around a zero line, violet; the numbers the current
// block changed most in teal. Bars glide to their new height when the block changes.
import { CONCEPT_COLORS } from '../../core/colors'

interface LayerVectorProps {
  values: number[]
  // The value that reaches the full half height; the same for every block.
  scale: number
  highlight: ReadonlySet<number>
  label: string
}

const HEIGHT_PX = 100
const HALF_PERCENT = 50

export function LayerVector({ values, scale, highlight, label }: LayerVectorProps) {
  return (
    <div role="img" aria-label={label} className="relative flex w-full shrink-0 rounded-lg" style={{ height: HEIGHT_PX, background: CONCEPT_COLORS.numbers.tint }}>
      <div className="absolute inset-x-0 top-1/2 h-0.5" style={{ background: CONCEPT_COLORS.numbers.soft }} />
      {values.map((value, index) => {
        const share = Math.min(1, Math.abs(value) / scale) * HALF_PERCENT
        const marked = highlight.has(index)
        return (
          <div key={index} className="relative h-full flex-1">
            <div
              className="absolute inset-x-0 transition-all duration-500 motion-reduce:transition-none"
              style={{
                top: `${value >= 0 ? HALF_PERCENT - share : HALF_PERCENT}%`,
                height: `${Math.max(share, 0.5)}%`,
                background: marked ? CONCEPT_COLORS.layers.solid : CONCEPT_COLORS.numbers.solid,
                zIndex: marked ? 1 : 0,
                boxShadow: marked ? `0 0 0 2px ${CONCEPT_COLORS.layers.solid}` : undefined,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
