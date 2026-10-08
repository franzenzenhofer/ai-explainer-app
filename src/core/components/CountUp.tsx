// A number that counts up to its value with a spring when it first shows or changes (old AnimatedNumber).
// With reduced motion the final value shows at once.
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'

interface CountUpProps {
  value: number
  format: (value: number) => string
}

export function CountUp({ value, format }: CountUpProps) {
  const reduced = useReducedMotion()
  const motionValue = useMotionValue(0)
  const text = useTransform(motionValue, format)
  useEffect(() => {
    if (reduced) {
      motionValue.jump(value)
      return
    }
    const controls = animate(motionValue, value, { type: 'spring', stiffness: 100, damping: 30 })
    return () => controls.stop()
  }, [value, reduced, motionValue])
  return <motion.span className="tabular-nums" aria-label={format(value)}>{text}</motion.span>
}
