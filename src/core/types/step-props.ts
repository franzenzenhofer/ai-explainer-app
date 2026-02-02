// Props interface shared by all step components

import type { StepConfig } from './index'

export interface StepProps {
  stepNumber: number
  totalSteps: number
  stepConfig: StepConfig
}
