// Hand-placed 2D positions for a few words, seeded positions for all remaining tokens (0 to 1 each).
// They illustrate the idea of a map; they are not computed from a real embedding table.

const HAND_PLACED: Record<string, [number, number]> = {
  king: [0.8, 0.2], queen: [0.82, 0.25], prince: [0.76, 0.28],
  dog: [0.12, 0.72], cat: [0.18, 0.76], animal: [0.14, 0.86],
  happy: [0.9, 0.55], sad: [0.08, 0.45], hungry: [0.3, 0.6],
  the: [0.45, 0.15], a: [0.5, 0.12], it: [0.55, 0.3],
}

const SEED_A = 1103515245
const SEED_B = 214013
const SEED_C = 2531011
const MODULUS = 0x7fffffff
// Keep seeded points off the very edge so labels stay inside the frame.
const EDGE = 1

export function sketchPosition(text: string, tokenId: number): [number, number] {
  const known = HAND_PLACED[text.trim().toLowerCase()]
  if (known) return known
  const x = (((tokenId * SEED_A + 12345) & MODULUS) / MODULUS) * EDGE
  const y = (((tokenId * SEED_B + SEED_C) & MODULUS) / MODULUS) * EDGE
  return [x, y]
}
