import { describe, expect, it } from 'vitest'
import { arcApexY, arcPath, arcRise, MAX_STROKE_PX, strokeFor } from './arcLayout'

describe('arc layout', () => {
  it('scales stroke width with the weight', () => {
    expect(strokeFor(1)).toBe(MAX_STROKE_PX)
    expect(strokeFor(0.5)).toBe(MAX_STROKE_PX / 2)
    expect(strokeFor(0.5)).toBeGreaterThan(strokeFor(0.25))
  })

  it('starts at the query and ends at the key', () => {
    expect(arcPath(300, 100, 160, 2)).toMatch(/^M 300 160 C .* 100 160$/)
  })

  it('rises higher for keys further back, up to a limit', () => {
    expect(arcRise(3)).toBeGreaterThan(arcRise(1))
    expect(arcRise(50)).toBe(arcRise(60))
  })

  it('puts the label above the base line', () => {
    expect(arcApexY(160, 2)).toBeLessThan(160)
  })
})
