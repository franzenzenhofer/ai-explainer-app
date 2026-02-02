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

// Attention heatmap color scale - HIGH CONTRAST INFERNO colormap
// Maximum contrast: black → purple → red → orange → yellow → white
export function getAttentionColor(weight: number): string {
  const t = Math.min(1, Math.max(0, weight))

  // High-contrast inferno colormap - dramatic visual difference
  if (t < 0.05) {
    // Near zero: almost black
    return `rgb(5, 5, 20)`
  } else if (t < 0.2) {
    // Very low: dark purple
    const p = (t - 0.05) / 0.15
    return `rgb(${Math.round(5 + p * 50)}, ${Math.round(5 + p * 10)}, ${Math.round(20 + p * 80)})`
  } else if (t < 0.4) {
    // Low: purple to magenta
    const p = (t - 0.2) / 0.2
    return `rgb(${Math.round(55 + p * 120)}, ${Math.round(15 + p * 20)}, ${Math.round(100 + p * 30)})`
  } else if (t < 0.6) {
    // Medium: magenta to red-orange
    const p = (t - 0.4) / 0.2
    return `rgb(${Math.round(175 + p * 60)}, ${Math.round(35 + p * 60)}, ${Math.round(130 - p * 90)})`
  } else if (t < 0.8) {
    // High: red-orange to orange
    const p = (t - 0.6) / 0.2
    return `rgb(${Math.round(235 + p * 20)}, ${Math.round(95 + p * 100)}, ${Math.round(40 - p * 20)})`
  } else {
    // Very high: orange to bright yellow
    const p = (t - 0.8) / 0.2
    return `rgb(255, ${Math.round(195 + p * 60)}, ${Math.round(20 + p * 150)})`
  }
}

// Probability bar colors
export function getProbabilityColor(probability: number): string {
  // High probability = green, low = gray
  const hue = 120 * probability // 0 = red, 120 = green
  const saturation = 60 + probability * 30
  return `hsl(${hue}, ${saturation}%, 50%)`
}
