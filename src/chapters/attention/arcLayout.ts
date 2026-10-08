// Geometry for the attention arcs: one slot per token on a line, arcs from a query back to earlier keys.

export const MIN_SLOT_PX = 56
const CHAR_PX = 11
const SLOT_PADDING_PX = 24
export const MAX_STROKE_PX = 16
const MIN_STROKE_PX = 1
const ARC_RISE_PER_SLOT_PX = 34
const MAX_ARC_RISE_PX = 150

export interface Slot {
  left: number
  width: number
  center: number
}

export function tokenSlots(texts: string[]): Slot[] {
  let left = 0
  return texts.map((text) => {
    const width = Math.max(MIN_SLOT_PX, text.trim().length * CHAR_PX + SLOT_PADDING_PX)
    const slot = { left, width, center: left + width / 2 }
    left += width
    return slot
  })
}

export function arcPath(fromX: number, toX: number, baseY: number, slotsApart: number): string {
  const rise = Math.min(MAX_ARC_RISE_PX, ARC_RISE_PER_SLOT_PX * Math.max(1, slotsApart))
  return `M ${fromX} ${baseY} C ${fromX} ${baseY - rise}, ${toX} ${baseY - rise}, ${toX} ${baseY}`
}

// Stroke width in pixels for an attention weight between 0 and 1: thickness equals weight.
export function strokeFor(weight: number): number {
  return Math.max(MIN_STROKE_PX, weight * MAX_STROKE_PX)
}

export const ARC_AREA_HEIGHT_PX = MAX_ARC_RISE_PX + MAX_STROKE_PX
