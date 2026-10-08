// The chassis of every chapter: top bar, one claim, the visual, the drawer, the sources, the Next link.
// The page scrolls; nothing is locked to the viewport height.
import type { CSSProperties, ReactNode } from 'react'
import { getChapter, neighbourChapter, type ChapterId } from '../chapters'
import { ChapterLink } from '../navigation/ChapterLink'
import { DepthDrawer } from './DepthDrawer'
import { SourcesLine } from './SourcesLine'
import { TopBar } from './TopBar'

interface ChapterLayoutProps {
  id: ChapterId
  children: ReactNode
  drawerExtra?: ReactNode
}

function NextLink({ id }: { id: ChapterId }) {
  const next = neighbourChapter(id, 1)
  const target = next ?? getChapter('home')
  const label = next ? 'Next' : 'Back to the start'
  return (
    <ChapterLink
      chapter={target}
      className="group flex min-h-11 items-baseline justify-between gap-4 border-t-2 border-ink py-6 text-ink no-underline"
    >
      <span>
        <span className="block text-base text-ink-2">{label}</span>
        <span className="font-serif text-2xl font-semibold group-hover:underline group-hover:underline-offset-4 sm:text-3xl">
          {target.name}
        </span>
      </span>
      <span aria-hidden="true" className="text-3xl transition-transform group-hover:translate-x-1">{'→'}</span>
    </ChapterLink>
  )
}

export function ChapterLayout({ id, children, drawerExtra }: ChapterLayoutProps) {
  const chapter = getChapter(id)
  const style = { '--accent': chapter.accent } as CSSProperties
  return (
    <div style={style} className="min-h-dvh bg-paper text-ink" data-chapter={id}>
      <TopBar chapter={chapter} />
      <main className="mx-auto max-w-5xl px-4 sm:px-8">
        <header className="pb-8 pt-10 sm:pt-14">
          <h1
            data-claim
            tabIndex={-1}
            className="m-0 max-w-[24ch] font-serif text-[2rem] font-semibold leading-[1.12] tracking-[-0.01em] text-ink outline-none sm:text-5xl"
          >
            {chapter.claim}
          </h1>
          <p className="m-0 mt-5 max-w-prose text-lg text-ink-2">{chapter.lookFor}</p>
        </header>
        <div className="pb-12">{children}</div>
        <DepthDrawer chapter={chapter} extra={drawerExtra} />
        <SourcesLine sources={chapter.sources} />
        <NextLink id={id} />
      </main>
    </div>
  )
}
