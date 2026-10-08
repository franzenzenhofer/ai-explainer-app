// Full screen on and off (also the F key).
import { Maximize2, Minimize2 } from 'lucide-react'
import { useIsFullscreen } from '../hooks/useFullscreen'
import { toggleFullscreen } from '../navigation/navigation'
import { cn } from '../utils/cn'

interface FullscreenButtonProps {
  className?: string
}

export function FullscreenButton({ className }: FullscreenButtonProps) {
  const on = useIsFullscreen()
  const Icon = on ? Minimize2 : Maximize2
  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      aria-pressed={on}
      title="Full screen (F)"
      className={cn('inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-ink/15 bg-paper px-3 text-base font-semibold text-ink hover:border-ink/40', className)}
    >
      <Icon aria-hidden="true" size={18} />
      {on ? 'Exit full screen' : 'Full screen'}
    </button>
  )
}
