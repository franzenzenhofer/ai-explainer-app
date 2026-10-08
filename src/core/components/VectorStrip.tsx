// A list of numbers drawn as bars around a zero line: up for positive, down for negative.
// No digits are printed, so simulated values never look measured.

interface VectorStripProps {
  values: number[]
  label: string
  // The value that reaches the full bar height; keep it fixed to compare strips.
  scale: number
  // Indices drawn in the chapter accent.
  highlight?: ReadonlySet<number>
  height?: number
}

const VIEW_WIDTH = 1000
const BAR_GAP = 0.2

export function VectorStrip({ values, label, scale, highlight, height = 120 }: VectorStripProps) {
  const half = height / 2
  const slot = VIEW_WIDTH / Math.max(1, values.length)
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      preserveAspectRatio="none"
      className="block h-auto w-full"
      style={{ height }}
    >
      <line x1={0} x2={VIEW_WIDTH} y1={half} y2={half} stroke="var(--rule-strong)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      {values.map((value, index) => {
        const barHeight = Math.min(1, Math.abs(value) / scale) * (half - 2)
        return (
          <rect
            key={index}
            x={index * slot + (slot * BAR_GAP) / 2}
            width={slot * (1 - BAR_GAP)}
            y={value >= 0 ? half - barHeight : half}
            height={Math.max(1, barHeight)}
            fill={highlight?.has(index) ? 'var(--accent)' : 'var(--ink)'}
          />
        )
      })}
    </svg>
  )
}
