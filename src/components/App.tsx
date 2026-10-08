// The app shell: picks the chapter from the URL (first render) or the store (after client-side
// navigation), keeps the browser history in step and restores the saved prompt after mount.
import { useEffect, type ComponentType } from 'react'
import { useAppStore } from '../store/appStore'
import { getChapter, type ChapterId } from '../core/chapters'
import { useArrowKeyNavigation, useHistorySync } from '../core/navigation/navigation'
import { DebugOverlay } from '../core/components/DebugOverlay'
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
  useArrowKeyNavigation(current)

  useEffect(() => {
    void useAppStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    const chapter = getChapter(current)
    document.title = chapter.route === '/' ? `${SITE_NAME} - how a language model works` : `${chapter.name} - ${SITE_NAME}`
  }, [current])

  const Chapter = CHAPTER_COMPONENTS[current]
  return (
    <>
      <Chapter key={current} />
      <DebugOverlay />
    </>
  )
}
