// The 16:9 stage. In presentation mode (the window holds 1280x720 or more) the canvas is drawn at
// 1280x720 and scaled to fit the window, letterboxed, so a slide that fits once fits at every size and
// in full screen. Narrower or lower windows get the flow mode: the slide reflows and the page scrolls,
// so text never shrinks below 16px. The mode is set before first paint by the script in Layout.astro.
import type { CSSProperties, ReactNode } from 'react'
import { conceptVars, type StageId } from '../colors'

interface SlideStageProps {
  theme: StageId
  slideId: string
  children: ReactNode
}

export function SlideStage({ theme, slideId, children }: SlideStageProps) {
  const style = conceptVars(theme) as CSSProperties
  return (
    <div className="stage-viewport" style={style}>
      <div className="stage-canvas" data-chapter={slideId} data-stage-canvas>
        {children}
      </div>
    </div>
  )
}
