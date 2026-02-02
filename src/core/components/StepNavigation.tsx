// StepNavigation - Bottom navigation bar with animated transitions
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useStep } from '../hooks/useStep'
import { useAppStore } from '../../store/appStore'
import { cn } from '../utils/cn'

export function StepNavigation() {
  const { currentStep, stepConfig, allSteps, isFirstStep, isLastStep, nextStep, prevStep, setCurrentStep } = useStep()
  const reset = useAppStore((s) => s.reset)

  return (
    <motion.nav
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/90 p-3 backdrop-blur shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Left: Step indicators */}
      <div className="flex items-center gap-1">
        {allSteps.map((step, index) => (
          <motion.button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={cn(
              'group relative h-8 rounded-lg px-3 text-xs font-medium transition-all',
              'hover:bg-slate-100',
              index === currentStep && 'bg-slate-100'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active indicator dot */}
            {index === currentStep && (
              <motion.div
                layoutId="step-indicator"
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: step.accentColor + '20' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex items-center gap-1.5',
                index === currentStep ? 'text-slate-900' : 'text-slate-500'
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                  index === currentStep ? 'bg-current text-white' : 'bg-slate-300'
                )}
                style={index === currentStep ? { backgroundColor: step.accentColor } : undefined}
              >
                {index + 1}
              </span>
              <span className="hidden lg:inline">{step.title}</span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Right: Navigation buttons */}
      <div className="flex items-center gap-2">
        {/* Reset button */}
        <motion.button
          onClick={reset}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>

        {/* Previous */}
        <motion.button
          onClick={prevStep}
          disabled={isFirstStep}
          className={cn(
            'flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-all',
            isFirstStep
              ? 'cursor-not-allowed text-slate-300'
              : 'text-slate-600 hover:bg-slate-100'
          )}
          whileHover={!isFirstStep ? { scale: 1.02 } : {}}
          whileTap={!isFirstStep ? { scale: 0.98 } : {}}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </motion.button>

        {/* Next / Finish */}
        <motion.button
          onClick={nextStep}
          disabled={isLastStep}
          className={cn(
            'flex h-9 items-center gap-1 rounded-lg px-4 text-sm font-medium transition-all',
            isLastStep
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'text-white'
          )}
          style={!isLastStep ? { backgroundColor: stepConfig.accentColor } : undefined}
          whileHover={!isLastStep ? { scale: 1.02 } : {}}
          whileTap={!isLastStep ? { scale: 0.98 } : {}}
        >
          <span>{isLastStep ? 'Complete' : 'Next'}</span>
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </motion.button>
      </div>
    </motion.nav>
  )
}
