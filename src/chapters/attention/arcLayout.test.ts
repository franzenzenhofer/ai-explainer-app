import { describe, expect, it } from 'vitest'
import { arcPath, MAX_STROKE_PX, MIN_SLOT_PX, strokeFor, tokenSlots } from './arcLayout'

describe('arc layout', () => {
  it('places slots left to right without gaps', () => {
    const slots = tokenSlots(['The', ' dog', ' barked'])
    expect(slots[0].left).toBe(0)
    expect(slots[1].left).toBe(slots[0].width)
    expect(slots[2].left).toBe(slots[0].width + slots[1].width)
    for (const slot of slots) expect(slot.width).toBeGreaterThanOrEqual(MIN_SLOT_PX)
  })

  it('scales stroke width with the weight', () => {
    expect(strokeFor(1)).toBe(MAX_STROKE_PX)
    expect(strokeFor(0.5)).toBe(MAX_STROKE_PX / 2)
    expect(strokeFor(0.5)).toBeGreaterThan(strokeFor(0.25))
  })

  it('starts at the query and ends at the key', () => {
    expect(arcPath(300, 100, 160, 2)).toMatch(/^M 300 160 C .* 100 160$/)
  })
})
