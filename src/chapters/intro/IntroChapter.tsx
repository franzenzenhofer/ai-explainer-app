// Slide 0: what you will see. The whole pipeline in its colours with one plain sentence per stage,
// drawn as a loop (the pick joins the text and everything runs again), then Start and Full screen.
import { motion } from 'motion/react'
import { useFirstPaint } from '../../core/hooks/useFirstPaint'
import { Play } from 'lucide-react'
import { getChapter, themeOf } from '../../core/chapters'
import { FullscreenButton } from '../../core/components/FullscreenButton'
import { SlideNav } from '../../core/components/SlideNav'
import { SlideStage } from '../../core/components/SlideStage'
import { SlideTop } from '../../core/components/SlideLayout'
import { ChapterLink } from '../../core/navigation/ChapterLink'
import { ChipLegend } from './ChipLegend'
import { PipelineLoop } from './PipelineLoop'

export function IntroChapter() {
  const chapter = getChapter('intro')
  const firstPaint = useFirstPaint()
  return (
    <SlideStage theme={themeOf(chapter)} slideId={chapter.id}>
      <SlideTop id={chapter.id} />
      <motion.div initial={firstPaint ? false : { opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="slide-title text-center">
        <h1 data-claim tabIndex={-1} className="m-0 text-[2.5rem] font-extrabold leading-tight tracking-tight text-ink outline-none">
          {chapter.claim}
        </h1>
        <p className="m-0 mt-1 text-xl text-ink-2">
          It predicts the next token, appends it, and runs again. These are the stages you will see, one slide each, each in its own colour.
        </p>
      </motion.div>
      <div className="slide-main intro-main" data-fit>
        <PipelineLoop />
        <ChipLegend />
      </div>
      <motion.div
        initial={firstPaint ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex items-center justify-center gap-3"
        data-primary-control
      >
        <ChapterLink
          chapter={getChapter('home')}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--accent)] px-6 text-xl font-bold text-paper no-underline shadow-md hover:opacity-90"
        >
          <Play aria-hidden="true" size={22} />
          Start
        </ChapterLink>
        <FullscreenButton className="min-h-12 text-lg" />
        <span className="text-base text-ink-2">or use the arrow keys, F for full screen</span>
      </motion.div>
      <SlideNav current={chapter.id} />
    </SlideStage>
  )
}
