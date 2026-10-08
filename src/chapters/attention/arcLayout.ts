// Geometry for the attention arcs: arcs from a query back to earlier keys on one line of chips.

export const MAX_STROKE_PX = 14
const MIN_STROKE_PX = 1.5
const ARC_RISE_PER_SLOT_PX = 30
const MAX_ARC_RISE_PX = 128
// Where a cubic arc with both control points at the same height reaches its top, as a share of the rise.
const APEX_SHARE = 0.75

export function arcRise(slotsApart: number): number {
  return Math.min(MAX_ARC_RISE_PX, ARC_RISE_PER_SLOT_PX * Math.max(1, slotsApart))
}

export function arcPath(fromX: number, toX: number, baseY: number, slotsApart: number): string {
  const rise = arcRise(slotsApart)
  return `M ${fromX} ${baseY} C ${fromX} ${baseY - rise}, ${toX} ${baseY - rise}, ${toX} ${baseY}`
}

// The highest point of an arc, where its weight label goes.
export function arcApexY(baseY: number, slotsApart: number): number {
  return baseY - arcRise(slotsApart) * APEX_SHARE
}

// Stroke width in pixels for an attention weight between 0 and 1: thickness equals weight.
export function strokeFor(weight: number): number {
  return Math.max(MIN_STROKE_PX, weight * MAX_STROKE_PX)
}

export const ARC_AREA_HEIGHT_PX = MAX_ARC_RISE_PX + MAX_STROKE_PX + 8
