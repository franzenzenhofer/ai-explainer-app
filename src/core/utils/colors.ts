// Single Source of Truth for all colors in the app

// Token colors - 10 distinct colors for visualizing tokens
export const TOKEN_COLORS = [
  'hsl(220, 90%, 56%)', // Blue
  'hsl(25, 95%, 53%)',  // Orange
  'hsl(150, 80%, 40%)', // Green
  'hsl(280, 85%, 55%)', // Purple
  'hsl(350, 90%, 55%)', // Red
  'hsl(45, 95%, 50%)',  // Yellow
  'hsl(180, 75%, 45%)', // Cyan
  'hsl(320, 80%, 55%)', // Pink
  'hsl(90, 70%, 45%)',  // Lime
  'hsl(200, 85%, 50%)', // Sky
] as const

// Step accent colors - each step has its own color identity
export const STEP_COLORS = {
  intro: 'hsl(240, 70%, 60%)',
  input: 'hsl(220, 90%, 56%)',
  tokenization: 'hsl(25, 95%, 53%)',
  embeddings: 'hsl(270, 91%, 65%)',
  attention: 'hsl(150, 80%, 45%)',
  prediction: 'hsl(45, 95%, 50%)',
  generation: 'hsl(180, 75%, 45%)',
  understanding: 'hsl(350, 90%, 55%)',
} as const

// Get TRULY UNIQUE token color - colors NEVER repeat
export function getTokenColor(index: number): string {
  // Golden ratio ensures maximum visual separation between consecutive colors
  const goldenRatio = 0.618033988749895
  const hue = ((index * goldenRatio) % 1) * 360
  // Vary saturation and lightness based on different primes to avoid patterns
  const saturation = 65 + ((index * 7) % 30) // 65-95%
  const lightness = 40 + ((index * 11) % 20) // 40-60%
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`
}

// Get step color by step ID
export function getStepColor(stepId: keyof typeof STEP_COLORS): string {
  return STEP_COLORS[stepId]
}

// Background variants (lighter/transparent versions of unique token colors)
export function getTokenBgColor(index: number, opacity = 0.2): string {
  const goldenRatio = 0.618033988749895
  const hue = ((index * goldenRatio) % 1) * 360
  const saturation = 65 + ((index * 7) % 30)
  const lightness = 40 + ((index * 11) % 20)
  return `hsla(${Math.round(hue)}, ${saturation}%, ${lightness}%, ${opacity})`
}

// Attention heatmap color scale - TURBO RAINBOW with OPACITY
// Color = position in rainbow, Opacity = strength of attention
export function getAttentionColor(weight: number): string {
  const t = Math.min(1, Math.max(0, weight))

  // OPACITY based on weight - low attention = transparent, high = opaque
  // Using exponential curve for more dramatic effect
  const opacity = Math.pow(t, 0.7) * 0.95 + 0.05 // Range: 0.05 to 1.0

  // Get hue from rainbow based on weight (0 = blue, 1 = hot pink)
  // Blue(240) → Cyan(180) → Green(120) → Yellow(60) → Orange(30) → Red(0) → Pink(330)
  let hue: number
  let saturation: number
  let lightness: number

  if (t < 0.15) {
    // Blue to Cyan
    hue = 240 - (t / 0.15) * 60 // 240 → 180
    saturation = 90
    lightness = 50
  } else if (t < 0.3) {
    // Cyan to Green
    hue = 180 - ((t - 0.15) / 0.15) * 60 // 180 → 120
    saturation = 95
    lightness = 45
  } else if (t < 0.45) {
    // Green to Lime/Yellow-Green
    hue = 120 - ((t - 0.3) / 0.15) * 40 // 120 → 80
    saturation = 100
    lightness = 50
  } else if (t < 0.6) {
    // Lime to Yellow
    hue = 80 - ((t - 0.45) / 0.15) * 30 // 80 → 50
    saturation = 100
    lightness = 55
  } else if (t < 0.75) {
    // Yellow to Orange
    hue = 50 - ((t - 0.6) / 0.15) * 25 // 50 → 25
    saturation = 100
    lightness = 55
  } else if (t < 0.9) {
    // Orange to Red
    hue = 25 - ((t - 0.75) / 0.15) * 25 // 25 → 0
    saturation = 100
    lightness = 50
  } else {
    // Red to Hot Pink/Magenta
    hue = 360 - ((t - 0.9) / 0.1) * 30 // 360 → 330
    saturation = 100
    lightness = 55
  }

  return `hsla(${Math.round(hue)}, ${saturation}%, ${lightness}%, ${opacity.toFixed(2)})`
}

// Probability bar colors
export function getProbabilityColor(probability: number): string {
  // High probability = green, low = gray
  const hue = 120 * probability // 0 = red, 120 = green
  const saturation = 60 + probability * 30
  return `hsl(${hue}, ${saturation}%, 50%)`
}
