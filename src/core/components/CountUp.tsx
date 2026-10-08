// A number that counts up to its value with a spring when it first shows or changes (old AnimatedNumber).
// The box is sized by the final value (an invisible copy), and the counting digits are right-aligned in
// it, so the number never changes width or position while it counts. With reduced motion the final
// value shows at once.
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
  return (
    <span className="relative inline-block tabular-nums">
      <span className="invisible">{format(value)}</span>
      <motion.span aria-hidden="true" className="absolute inset-0 text-right">{text}</motion.span>
    </span>
  )
}
