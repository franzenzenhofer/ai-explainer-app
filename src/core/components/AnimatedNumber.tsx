// AnimatedNumber - Smooth number transitions
import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import { formatNumber } from '../utils/formatters'
import { cn } from '../utils/cn'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

export function AnimatedNumber({
  value,
  format = formatNumber,
  duration = 0.5,
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) => format(Math.round(current)))
  const [displayValue, setDisplayValue] = useState(format(value))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    const unsubscribe = display.on('change', setDisplayValue)
    return unsubscribe
  }, [display])

  return (
    <motion.span
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayValue}
    </motion.span>
  )
}

// Counter with label
interface LabeledCounterProps {
  value: number
  label: string
  format?: (n: number) => string
  icon?: React.ReactNode
  accentColor?: string
  className?: string
}

export function LabeledCounter({
  value,
  label,
  format = formatNumber,
  icon,
  accentColor,
  className,
}: LabeledCounterProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="flex items-center gap-2">
        {icon && (
          <span style={accentColor ? { color: accentColor } : undefined}>
            {icon}
          </span>
        )}
        <AnimatedNumber
          value={value}
          format={format}
          className="text-2xl font-bold text-slate-900"
        />
      </div>
      <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  )
}

// Progress indicator with animated fill
interface ProgressBarProps {
  progress: number // 0-1
  label?: string
  showPercentage?: boolean
  accentColor?: string
  className?: string
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  accentColor = 'hsl(220, 90%, 56%)',
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs text-slate-500">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="tabular-nums">{Math.round(clampedProgress * 100)}%</span>
          )}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
