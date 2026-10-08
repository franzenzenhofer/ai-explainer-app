// Slim top bar: chapter name and position, the shared prompt (from chapter 3 on), the menu button.
import { useCallback, useId, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { CHAPTERS, chapterIndex, getChapter, type Chapter } from '../chapters'
import { ChapterLink } from '../navigation/ChapterLink'
import { useEscape } from '../navigation/navigation'
import { ChapterMenu } from './ChapterMenu'
import { PromptBar } from './PromptBar'

interface TopBarProps {
  chapter: Chapter
}

export function TopBar({ chapter }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const resetAll = useAppStore((s) => s.resetAll)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useEscape(menuOpen, closeMenu)

  const onReset = () => {
    resetAll()
    closeMenu()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper">
      <div className="relative">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-8 lg:flex-nowrap">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
            <ChapterLink chapter={getChapter('home')} className="hidden min-h-11 shrink-0 items-center text-base font-bold text-ink no-underline sm:inline-flex">
              AI Explorer
            </ChapterLink>
            <p className="m-0 truncate text-base font-semibold text-ink">{chapter.name}</p>
            <p className="m-0 shrink-0 text-base text-ink-2">
              {chapterIndex(chapter.id) + 1} of {CHAPTERS.length}
            </p>
          </div>
          {chapter.promptPlacement === 'topBar' && (
            <div className="order-last min-w-0 basis-full lg:order-none lg:flex-1 lg:basis-auto">
              <PromptBar />
            </div>
          )}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto min-h-11 shrink-0 rounded-[3px] border-2 border-ink px-4 text-base font-semibold text-ink hover:bg-wash"
          >
            {menuOpen ? 'Close' : 'Chapters'}
          </button>
        </div>
        {menuOpen && <ChapterMenu id={menuId} current={chapter.id} onClose={closeMenu} onReset={onReset} />}
      </div>
    </header>
  )
}
