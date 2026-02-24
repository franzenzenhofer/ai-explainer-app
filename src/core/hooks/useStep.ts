// Hook for step navigation and state

import { useCallback, useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import type { StepConfig, StepId, EducationalContent } from '../types'
import { STEP_COLORS } from '../utils/colors'

// Step configurations
const STEPS: StepConfig[] = [
  {
    id: 'intro',
    title: 'Welcome',
    subtitle: 'How Language Models Generate Text',
    accentColor: STEP_COLORS.intro,
    educational: {
      what: 'Language models predict the next token based on learned patterns.',
      how: 'Every token has probability relationships to every other token in the vocabulary.',
      why: 'Understanding this foundation helps you use these tools more effectively.',
    },
  },
  {
    id: 'input',
    title: 'Input',
    subtitle: 'Enter Your Prompt',
    accentColor: STEP_COLORS.input,
    educational: {
      what: 'A prompt is the starting text for the model — your question or instruction.',
      how: 'The model cannot read text like humans — it must first convert it into numbers.',
      why: 'The quality of your input directly affects the quality of the output.',
    },
  },
  {
    id: 'tokenization',
    title: 'Tokenization',
    subtitle: 'Breaking Text into Pieces',
    accentColor: STEP_COLORS.tokenization,
    educational: {
      what: 'Tokens are the "alphabet" of language models — not letters, not words, but substring units.',
      how: 'The Byte-Pair Encoding algorithm merges frequent character pairs. "Großmutter" → ["Groß", "mutter"]',
      why: 'Balance between vocabulary size (200,000 tokens) and flexibility to handle any text.',
    },
  },
  {
    id: 'embeddings',
    title: 'Embeddings',
    subtitle: 'Tokens Become Numbers',
    accentColor: STEP_COLORS.embeddings,
    educational: {
      what: 'Each token becomes a vector — a list of 4,096 numbers, like GPS coordinates for meaning.',
      how: 'Learned during training: tokens appearing in similar contexts get pushed to similar vectors. No human labels needed.',
      why: 'Computers work with numbers, not text. Vectors let the model calculate similarity and relationships mathematically.',
    },
  },
  {
    id: 'attention',
    title: 'Attention',
    subtitle: 'How Tokens Understand Context',
    accentColor: STEP_COLORS.attention,
    educational: {
      what: 'Every token "looks at" all other tokens simultaneously to understand context.',
      how: 'Each token asks "which other tokens matter?" (query), checks every candidate (key), then blends the important ones (value).',
      why: 'Enables "it" to know it refers to "dog" even sentences apart.',
    },
  },
  {
    id: 'prediction',
    title: 'Prediction',
    subtitle: 'Calculating Probabilities',
    accentColor: STEP_COLORS.prediction,
    educational: {
      what: 'The model assigns a probability to each of the 200,000 possible tokens, then picks one.',
      how: 'The final layer converts the 4,096-number representation into 200,000 probabilities using Softmax.',
      why: 'Enables both deterministic (greedy) and creative (sampling) generation.',
    },
  },
  {
    id: 'generation',
    title: 'Generation',
    subtitle: 'Token by Token',
    accentColor: STEP_COLORS.generation,
    educational: {
      what: 'Language models generate one token at a time, then the entire process repeats.',
      how: 'New token joins input → full transformer runs again → next token.',
      why: 'This is why streaming works — each token is complete and independent.',
    },
  },
  {
    id: 'understanding',
    title: 'Understanding',
    subtitle: 'Pattern vs Meaning',
    accentColor: STEP_COLORS.understanding,
    educational: {
      what: 'These models do not understand — they follow statistical patterns learned from text.',
      how: 'Training = absorbing patterns from billions of texts. No true comprehension.',
      why: 'The "stochastic parrot" debate — do these systems truly understand, or just echo patterns?',
    },
  },
]

export function useStep() {
  const currentStep = useAppStore((s) => s.currentStep)
  const setCurrentStep = useAppStore((s) => s.setCurrentStep)
  const nextStep = useAppStore((s) => s.nextStep)
  const prevStep = useAppStore((s) => s.prevStep)

  const stepConfig = useMemo(() => STEPS[currentStep], [currentStep])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === STEPS.length - 1

  const goToStep = useCallback((stepId: StepId) => {
    const index = STEPS.findIndex((s) => s.id === stepId)
    if (index !== -1) {
      setCurrentStep(index)
    }
  }, [setCurrentStep])

  const getStepByIndex = useCallback((index: number): StepConfig | undefined => {
    return STEPS[index]
  }, [])

  const allSteps = STEPS

  return {
    currentStep,
    stepConfig,
    allSteps,
    isFirstStep,
    isLastStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goToStep,
    getStepByIndex,
    totalSteps: STEPS.length,
  }
}

export function getEducationalContent(stepId: StepId): EducationalContent {
  const step = STEPS.find((s) => s.id === stepId)
  return step?.educational ?? { what: '', how: '', why: '' }
}
