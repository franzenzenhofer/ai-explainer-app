// Shared animation configurations for consistent motion across the app

import type { Variants, Transition } from 'motion/react'

// Standard transition for step navigation
export const stepTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier
}

// Fade in/out with slide
export const fadeSlide: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: stepTransition },
  exit: { opacity: 0, x: -20, transition: stepTransition },
}

// Staggered children animation
export function staggerChildren(delay = 0.05): Variants {
  return {
    animate: {
      transition: {
        staggerChildren: delay,
      },
    },
  }
}

// Individual child animation for staggered lists
export const staggerChild: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

// Token appearance animation
export const tokenAppear: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
}

// Pulse animation for emphasis
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2
    },
  },
}

// Typing cursor blink
export const cursorBlink: Variants = {
  animate: {
    opacity: [1, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: 'reverse'
    },
  },
}

// Progress bar fill
export function progressFill(progress: number): Variants {
  return {
    initial: { width: 0 },
    animate: {
      width: `${progress * 100}%`,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  }
}

// Number counter animation config
export const numberSpring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
}

// Attention line draw animation
export const lineDrawVariants: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeInOut' }
  },
}

// Heatmap cell reveal
export const heatmapCell: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  },
}

// Generation token stream
export const tokenStream: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  },
}
