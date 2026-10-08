// Measures the horizontal centre of every [data-slot] child of a row, relative to the row, so arcs and
// lines can be drawn to real chip positions. Re-measures when the row resizes (fonts, new text).
import { useLayoutEffect, useRef, useState } from 'react'

export interface RowGeometry {
  centers: number[]
  width: number
}

const EMPTY: RowGeometry = { centers: [], width: 0 }

function measure(row: HTMLElement): RowGeometry {
  const slots = Array.from(row.querySelectorAll<HTMLElement>('[data-slot]'))
  return { centers: slots.map((slot) => slot.offsetLeft + slot.offsetWidth / 2), width: row.scrollWidth }
}

export function useCenters<T extends HTMLElement>(key: string) {
  const rowRef = useRef<T>(null)
  const [geometry, setGeometry] = useState<RowGeometry>(EMPTY)
  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const update = () => setGeometry(measure(row))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(row)
    return () => observer.disconnect()
  }, [key])
  return { rowRef, geometry }
}
