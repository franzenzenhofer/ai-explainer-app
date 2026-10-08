// Play for the stack: walks the running vector up one block at a time until the top block.
import { useEffect, useState } from 'react'

const STEP_MS = 700

// top: the number of the last block, where Play stops.
export function usePlayBlocks(block: number, setBlock: (block: number) => void, top: number) {
  const [playing, setPlaying] = useState(false)
  const atTop = block >= top
  useEffect(() => {
    if (!playing || atTop) return
    const timer = window.setTimeout(() => {
      setBlock(block + 1)
      if (block + 1 >= top) setPlaying(false)
    }, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [playing, atTop, block, setBlock, top])
  const toggle = () => {
    if (playing && !atTop) {
      setPlaying(false)
      return
    }
    if (atTop) setBlock(0)
    setPlaying(true)
  }
  return { playing: playing && !atTop, toggle }
}
