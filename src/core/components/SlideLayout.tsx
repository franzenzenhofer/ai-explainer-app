// The chassis of every slide: pipeline bar, claim as title, the visual on the left two thirds, the
// explanation and colour key on the right third, the bottom navigation, and the overlays.
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { getChapter, themeOf, type ChapterId } from '../chapters'
import { ChapterLink } from '../navigation/ChapterLink'
import { DeeperSections, SourcesList } from './DeeperContent'
import { FullscreenButton } from './FullscreenButton'
import { Overlay } from './Overlay'
import { PipelineBar } from './PipelineBar'
import { PromptBar } from './PromptBar'
import { SidePanel, type OverlayKind } from './SidePanel'
import { SlideNav } from './SlideNav'
import { SlideStage } from './SlideStage'

// A slide enters like the old app's step change: fade in and slide from the right; the side panel follows.
export const ENTER_TITLE = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3 } }
const ENTER_MAIN = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.05 } }
const ENTER_SIDE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: 0.2 } }

interface SlideLayoutProps {
  id: ChapterId
  children: ReactNode
  drawerExtra?: ReactNode
}

export function SlideTop({ id }: { id: ChapterId }) {
  const chapter = getChapter(id)
  return (
    <header className="slide-top flex items-center gap-3">
      <ChapterLink chapter={getChapter('intro')} className="inline-flex min-h-11 shrink-0 items-center text-lg font-extrabold text-ink no-underline">
        AI Explorer
      </ChapterLink>
      <PipelineBar current={chapter.stage} />
      <FullscreenButton className="shrink-0" />
    </header>
  )
}

export function SlideLayout({ id, children, drawerExtra }: SlideLayoutProps) {
  const chapter = getChapter(id)
  const [overlay, setOverlay] = useState<OverlayKind | null>(null)
  const close = () => setOverlay(null)
  return (
    <SlideStage theme={themeOf(chapter)} slideId={id}>
      <SlideTop id={id} />
      <motion.div {...ENTER_TITLE} className="slide-title flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 data-claim tabIndex={-1} className="m-0 text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink outline-none">
            {chapter.claim}
          </h1>
          <p className="m-0 mt-0.5 text-lg font-medium" style={{ color: 'var(--concept-strong)' }}>{chapter.lookFor}</p>
        </div>
        {chapter.promptPlacement === 'topBar' && (
          <div className="slide-prompt w-[22rem] shrink-0">
            <PromptBar />
          </div>
        )}
      </motion.div>
      <motion.div {...ENTER_MAIN} className="slide-main">
        <div className="slide-visual" data-fit>{children}</div>
        <motion.aside {...ENTER_SIDE} className="slide-side" data-fit aria-label="Explanation">
          <SidePanel chapter={chapter} onOpen={setOverlay} />
        </motion.aside>
      </motion.div>
      <SlideNav current={id} />
      {overlay === 'deeper' && (
        <Overlay title={chapter.drawerTitle} onClose={close}>
          <DeeperSections chapter={chapter} extra={drawerExtra} />
        </Overlay>
      )}
      {overlay === 'sources' && (
        <Overlay title={`Sources: ${chapter.shortName}`} onClose={close}>
          <SourcesList chapter={chapter} />
        </Overlay>
      )}
    </SlideStage>
  )
}
