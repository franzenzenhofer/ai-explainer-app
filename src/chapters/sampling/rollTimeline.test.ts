import { describe, expect, it } from 'vitest'
import { ROLL_PLAN, rollTimeline } from './rollTimeline'

const kept = [' the', ' a', ' his']

describe('rollTimeline', () => {
  it('lands on every pick in order and shows one more pick after each landing', () => {
    const frames = rollTimeline(kept, [' a', ' the'])
    const landings = frames.filter((frame) => frame.landed)
    expect(landings.map((frame) => frame.highlight)).toEqual([...Array(ROLL_PLAN.holdSteps).fill(' a'), ...Array(ROLL_PLAN.holdSteps).fill(' the')])
    expect(frames[frames.length - 1].shown).toBe(2)
  })

  it('only sweeps over kept tokens', () => {
    for (const frame of rollTimeline(kept, [' his', ' his', ' a'])) expect(kept).toContain(frame.highlight)
  })

  it('has no frames when nothing is kept', () => {
    expect(rollTimeline([], [' a'])).toEqual([])
  })
})
