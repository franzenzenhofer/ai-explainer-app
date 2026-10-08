// The frames of the "Pick 5 times" animation: for each pick a highlight runs over the kept tokens,
// then lands on the token the weighted roll picked and that pick joins the row. Pure, so it is tested.

export interface RollFrame {
  // The token the highlight is on, or null between rolls.
  highlight: string | null
  landed: boolean
  // How many picks are shown in the row at this frame.
  shown: number
}

export interface RollPlan {
  sweepSteps: number
  holdSteps: number
}

export const ROLL_PLAN: RollPlan = { sweepSteps: 5, holdSteps: 2 }

function pickFrames(kept: string[], pick: string, index: number, plan: RollPlan): RollFrame[] {
  const sweep = Array.from({ length: plan.sweepSteps }, (_, step) => ({
    highlight: kept[(index * 2 + step) % kept.length] ?? null,
    landed: false,
    shown: index,
  }))
  const hold = Array.from({ length: plan.holdSteps }, () => ({ highlight: pick, landed: true, shown: index + 1 }))
  return [...sweep, ...hold]
}

export function rollTimeline(kept: string[], picks: string[], plan: RollPlan = ROLL_PLAN): RollFrame[] {
  if (kept.length === 0) return []
  return picks.flatMap((pick, index) => pickFrames(kept, pick, index, plan))
}
