// The app shell: picks the slide from the URL (first render) or the store (after client-side
// navigation), keeps the browser history in step and restores the saved prompt after mount.
import { useEffect, type ComponentType } from 'react'
import { MotionConfig } from 'motion/react'
import { useAppStore } from '../store/appStore'
import { getChapter, type ChapterId } from '../core/chapters'
import { useHistorySync, usePresentationKeys } from '../core/navigation/navigation'
import { markAppMounted } from '../core/hooks/useFirstPaint'
import { DebugOverlay } from '../core/components/DebugOverlay'
import { IntroChapter } from '../chapters/intro/IntroChapter'
import { HomeChapter } from '../chapters/home/HomeChapter'
import { TokensChapter } from '../chapters/tokens/TokensChapter'
import { NumbersChapter } from '../chapters/numbers/NumbersChapter'
import { AttentionChapter } from '../chapters/attention/AttentionChapter'
import { FeedForwardChapter } from '../chapters/feedforward/FeedForwardChapter'
import { LayersChapter } from '../chapters/layers/LayersChapter'
import { ScoresChapter } from '../chapters/scores/ScoresChapter'
import { SamplingChapter } from '../chapters/sampling/SamplingChapter'
import { LoopChapter } from '../chapters/loop/LoopChapter'
import { RealityChapter } from '../chapters/reality/RealityChapter'

export const CHAPTER_COMPONENTS: Record<ChapterId, ComponentType> = {
  intro: IntroChapter,
  home: HomeChapter,
  tokens: TokensChapter,
  numbers: NumbersChapter,
  attention: AttentionChapter,
  feedforward: FeedForwardChapter,
  layers: LayersChapter,
  scores: ScoresChapter,
  sampling: SamplingChapter,
  loop: LoopChapter,
  reality: RealityChapter,
}

const SITE_NAME = 'AI Explorer'

interface AppProps {
  initialChapter: ChapterId
}

export function App({ initialChapter }: AppProps) {
  const current = useAppStore((s) => s.chapterId) ?? initialChapter
  useHistorySync()
  usePresentationKeys(current)

  useEffect(() => {
    void useAppStore.persist.rehydrate()
    markAppMounted()
    // One frame later the restored prompt has rendered: the slide body shows (see Layout.astro), and the
    // browser walk knows that React has hydrated and the controls respond.
    const frame = requestAnimationFrame(() => {
      document.documentElement.dataset.ready = 'true'
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const chapter = getChapter(current)
    document.title = chapter.route === '/' ? `${SITE_NAME} - how a language model works` : `${chapter.name} - ${SITE_NAME}`
  }, [current])

  const Chapter = CHAPTER_COMPONENTS[current]
  // reducedMotion="user": every motion animation is skipped when the reader asks for reduced motion.
  return (
    <MotionConfig reducedMotion="user">
      <Chapter key={current} />
      <DebugOverlay />
    </MotionConfig>
  )
}
