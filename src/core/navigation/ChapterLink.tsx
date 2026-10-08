// A real link to a chapter route that navigates in place on a plain click.
import type { MouseEvent, ReactNode } from 'react'
import type { Chapter } from '../chapters'
import { navigateTo } from './navigation'

interface ChapterLinkProps {
  chapter: Chapter
  className?: string
  children: ReactNode
  current?: 'page'
  onNavigate?: () => void
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

export function ChapterLink({ chapter, className, children, current, onNavigate }: ChapterLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return
    event.preventDefault()
    onNavigate?.()
    navigateTo(chapter)
  }
  return (
    <a href={chapter.route} className={className} onClick={onClick} aria-current={current}>
      {children}
    </a>
  )
}
