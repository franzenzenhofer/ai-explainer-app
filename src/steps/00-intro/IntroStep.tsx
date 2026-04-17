// Step 0: Intro - Welcome and Overview
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { StepProps } from '../../core/types/step-props'
import { TokenProbabilityGraphic } from './TokenProbabilityGraphic'

export function IntroStep({ stepConfig }: StepProps) {
  const nextStep = useAppStore((s) => s.nextStep)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
          How AI Works
        </h1>
        <p className="text-xl font-medium text-slate-700">
          It predicts the next token. Over and over again.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          An interactive walk-through — in 8 small steps — of the one idea every modern AI runs on.
        </p>
      </motion.div>

      {/* Token Probability Graphic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <TokenProbabilityGraphic />
      </motion.div>

      {/* Start Button */}
      <motion.button
        onClick={nextStep}
        className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-5 text-xl font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <Play className="h-7 w-7 transition-transform group-hover:translate-x-0.5" />
        Start the Journey
      </motion.button>

      {/* Subtitle */}
      <motion.p
        className="max-w-lg text-center text-sm text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        8 interactive steps · Real tokenization · Live AI predictions
      </motion.p>
    </div>
  )
}
