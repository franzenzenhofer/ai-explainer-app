// Client-side chapter navigation on top of real URLs: every chapter is also a static page, so a
// deep link or a reload loads it directly, and pushState keeps the store (prompt, drawers) alive
// between chapters. The back button works through popstate.

import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { chapterFromPath, neighbourChapter, type Chapter, type ChapterId } from '../chapters'

const CLAIM_SELECTOR = '[data-claim]'

function focusClaim() {
  window.requestAnimationFrame(() => document.querySelector<HTMLElement>(CLAIM_SELECTOR)?.focus())
}

export function navigateTo(chapter: Chapter) {
  if (window.location.pathname !== chapter.route) window.history.pushState({ chapterId: chapter.id }, '', chapter.route)
  useAppStore.getState().setChapterId(chapter.id)
  window.scrollTo({ top: 0, behavior: 'instant' })
  focusClaim()
}

// Keeps the store in step with the browser history (back and forward buttons).
export function useHistorySync() {
  const setChapterId = useAppStore((s) => s.setChapterId)
  useEffect(() => {
    const onPopState = () => {
      const chapter = chapterFromPath(window.location.pathname)
      if (!chapter) throw new Error(`No chapter for path ${window.location.pathname}`)
      setChapterId(chapter.id)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setChapterId])
}

const TYPING_TARGETS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return TYPING_TARGETS.has(target.tagName) || target.isContentEditable
}

const ARROW_OFFSETS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }

// Left and right arrows move to the previous and next chapter, except while typing or on a slider.
export function useArrowKeyNavigation(current: ChapterId) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const offset = ARROW_OFFSETS[event.key]
      if (!offset || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (isTypingTarget(event.target)) return
      const target = neighbourChapter(current, offset)
      if (!target) return
      event.preventDefault()
      navigateTo(target)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [current])
}

// Escape runs onEscape while active is true (drawers, the chapter menu).
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, onEscape])
}
