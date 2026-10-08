// The colour key of every slide: which colour means what. Two codings appear: concept colours
// (the stage) and token identity colours (the same token keeps its colour on every slide).

import type { ChapterId, ColorKeyEntry } from './types'

const CHIPS: ColorKeyEntry = { color: 'identity', mark: 'chips', label: 'Coloured chips: tokens. Each token keeps its colour on every slide.' }
const IDS: ColorKeyEntry = { color: 'identity', mark: 'id', label: 'The number after # is the token\'s ID in the fixed list.' }

export const COLOR_KEYS: Record<ChapterId, ColorKeyEntry[]> = {
  intro: [CHIPS],
  home: [
    CHIPS,
    { color: 'scores', mark: 'bar', label: 'Rose bars: how likely each candidate is.' },
    { color: 'pick', mark: 'frame', label: 'Amber: the token that was picked.' },
    { color: 'append', mark: 'frame', label: 'Indigo: added to the end of the text.' },
  ],
  tokens: [
    CHIPS,
    IDS,
    { color: 'tokens', mark: 'frame', label: 'Blue frame: the tokens stage.' },
  ],
  numbers: [
    CHIPS,
    { color: 'numbers', mark: 'bar', label: 'Violet bars: the token\'s numbers. Up is positive, down negative.' },
    { color: 'numbers', mark: 'dot', label: 'Violet rings: the most similar tokens.' },
  ],
  attention: [
    CHIPS,
    { color: 'attention', mark: 'arc', label: 'Orange arcs: attention. Thicker means more weight.' },
    { color: 'attention', mark: 'cell', label: 'Darker orange cell: more weight.' },
  ],
  feedforward: [
    { color: 'numbers', mark: 'bar', label: 'Violet bars: the numbers of each position.' },
    { color: 'feedforward', mark: 'bar', label: 'Green: the number the feed-forward step moved most.' },
    { color: 'attention', mark: 'arc', label: 'Orange lines: attention, for comparison.' },
  ],
  layers: [
    { color: 'layers', mark: 'frame', label: 'Teal: the stack of blocks, the current one filled.' },
    { color: 'numbers', mark: 'bar', label: 'Violet bars: the running vector of the last position.' },
    { color: 'layers', mark: 'bar', label: 'Teal bars: the numbers this block changed most.' },
  ],
  scores: [
    CHIPS,
    { color: 'scores', mark: 'bar', label: 'Rose bars: probability of each next token.' },
    { color: 'text', mark: 'grey', label: 'Grey bar: all other tokens together.' },
  ],
  sampling: [
    { color: 'scores', mark: 'bar', label: 'Rose bars: probabilities after the settings.' },
    { color: 'text', mark: 'dashed', label: 'Dashed: cut by the settings.' },
    { color: 'pick', mark: 'frame', label: 'Amber: the picked token.' },
  ],
  loop: [
    CHIPS,
    { color: 'append', mark: 'frame', label: 'Indigo: tokens appended by the loop.' },
    { color: 'pick', mark: 'frame', label: 'The status strip lights each stage in its colour.' },
  ],
  reality: [
    CHIPS,
    { color: 'scores', mark: 'frame', label: 'Rose: the live reply. Fluent is not the same as true.' },
  ],
}
