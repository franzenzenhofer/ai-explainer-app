// A real link to a chapter route that navigates in place on a plain click.
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import type { Chapter } from '../chapters'
import { navigateTo } from './navigation'

interface ChapterLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  chapter: Chapter
  onNavigate?: () => void
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

export function ChapterLink({ chapter, onNavigate, children, ...rest }: ChapterLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return
    event.preventDefault()
    onNavigate?.()
    navigateTo(chapter)
  }
  return (
    <a {...rest} href={chapter.route} onClick={onClick}>
      {children}
    </a>
  )
}
