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
// Space and Enter on these elements press them; the slide keys leave them alone.
const PRESSABLE_TARGETS = new Set(['BUTTON', 'A', 'SUMMARY'])

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return TYPING_TARGETS.has(target.tagName) || target.isContentEditable
}

function isPressable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && PRESSABLE_TARGETS.has(target.tagName)
}

const SLIDE_OFFSETS: Record<string, number> = { ArrowLeft: -1, PageUp: -1, ArrowRight: 1, PageDown: 1, ' ': 1 }
const FULLSCREEN_KEYS = new Set(['f', 'F'])

// Full screen on and off with the Fullscreen API; the stage rescales on the resize that follows.
export function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen()
    return
  }
  void document.documentElement.requestFullscreen()
}

function slideOffset(event: KeyboardEvent): number {
  const offset = SLIDE_OFFSETS[event.key] ?? 0
  if (event.key === ' ' && isPressable(event.target)) return 0
  return offset
}

// Presentation keys: Right, Space, Page Down = next slide; Left, Page Up = previous; F = full screen.
// Nothing happens while typing, on a slider, or with a modifier key held.
export function usePresentationKeys(current: ChapterId) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isTypingTarget(event.target)) return
      if (FULLSCREEN_KEYS.has(event.key)) {
        event.preventDefault()
        toggleFullscreen()
        return
      }
      const offset = slideOffset(event)
      const target = offset ? neighbourChapter(current, offset) : null
      if (!target) return
      event.preventDefault()
      navigateTo(target)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [current])
}

// Escape runs onEscape while active is true (overlays).
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
