// The pick flying from the candidate list to the end of the text during the Append stage. Positions
// are measured in the stage's own (unscaled) coordinates, so the flight lands right at any zoom.
import { motion } from 'motion/react'
import { useLayoutEffect, useState, type RefObject } from 'react'
import { CONCEPT_COLORS, tokenColor } from '../../core/colors'
import { useAppStore } from '../../store/appStore'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { stageDuration, useRunStore } from './runStore'

// Share of the Append stage the flight takes; the rest is the landing.
const FLIGHT_SHARE = 0.75

interface Point {
  x: number
  y: number
}

interface Flight {
  from: Point
  to: Point
}

function localPoint(root: HTMLElement, target: Element): Point {
  const rootBox = root.getBoundingClientRect()
  const box = target.getBoundingClientRect()
  const scale = rootBox.width / root.offsetWidth || 1
  return { x: (box.left - rootBox.left) / scale, y: (box.top - rootBox.top) / scale }
}

function measure(root: HTMLElement): Flight | null {
  const source = root.querySelector('[data-pick-source]')
  const end = root.querySelector('[data-text-end]')
  if (!source || !end) return null
  return { from: localPoint(root, source), to: localPoint(root, end) }
}

export function FlightLayer({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const stage = useRunStore((s) => s.stage)
  const pick = useRunStore((s) => s.pick)
  const speed = useAppStore((s) => s.generationSpeed)
  const [flight, setFlight] = useState<Flight | null>(null)
  useLayoutEffect(() => {
    const root = rootRef.current
    setFlight(stage === 'append' && root ? measure(root) : null)
  }, [stage, rootRef])
  if (!flight || pick === null) return null
  const color = tokenColor(pick)
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-30 whitespace-pre rounded-md border-[3px] px-2 py-1 font-mono text-2xl font-bold"
      style={{ background: color.fill, color: color.text, boxShadow: `0 6px 20px ${CONCEPT_COLORS.pick.soft}` }}
      initial={{ x: flight.from.x, y: flight.from.y, scale: 1, borderColor: CONCEPT_COLORS.pick.solid }}
      animate={{ x: flight.to.x, y: flight.to.y, scale: [1, 1.35, 1.1], borderColor: [CONCEPT_COLORS.pick.solid, CONCEPT_COLORS.pick.solid, CONCEPT_COLORS.append.solid] }}
      transition={{ duration: (stageDuration('append', speed) * FLIGHT_SHARE) / 1000, ease: 'easeInOut' }}
    >
      {formatTokenDisplay(pick)}
    </motion.span>
  )
}
