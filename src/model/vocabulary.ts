// Candidate tokens for the illustrative next-token distribution. Each entry is one o200k_base token
// (the test checks it). Grouped by role so the context can lift one group over the others.

export interface CandidatePools {
  starters: string[]
  nouns: string[]
  functionWords: string[]
  punctuation: string[]
}

export const ENGLISH_POOLS: CandidatePools = {
  starters: [' The', ' It', ' He', ' She', ' They', ' I', ' But', ' Then', ' When', ' After', ' We', ' This'],
  nouns: [
    ' dog', ' cat', ' man', ' woman', ' day', ' time', ' food', ' water', ' house', ' door', ' night',
    ' morning', ' ball', ' park', ' street', ' car', ' world', ' city', ' child', ' friend',
  ],
  functionWords: [
    ' the', ' a', ' and', ' to', ' of', ' in', ' it', ' was', ' is', ' that', ' on', ' with', ' for',
    ' at', ' as', ' but', ' not', ' so', ' very', ' just', ' still', ' again', ' then', ' all', ' out',
    ' because', ' when', ' after',
  ],
  punctuation: ['.', ',', '!', '?', '\n'],
}

export const GERMAN_POOLS: CandidatePools = {
  starters: [' Der', ' Die', ' Das', ' Es', ' Er', ' Sie', ' Ich', ' Wir', ' Dann', ' Aber', ' Als', ' Nach'],
  nouns: [
    ' Hund', ' Katze', ' Mann', ' Frau', ' Tag', ' Zeit', ' Haus', ' Tür', ' Nacht', ' Morgen', ' Welt',
    ' Stadt', ' Kind', ' Wald', ' Weg', ' Auto', ' Wasser', ' Freund', ' Ball', ' Park',
  ],
  functionWords: [
    ' und', ' die', ' der', ' das', ' ist', ' ein', ' eine', ' für', ' mit', ' auf', ' nicht', ' von',
    ' wie', ' war', ' es', ' sich', ' zu', ' den', ' dem', ' im', ' noch', ' auch', ' so', ' sehr',
    ' weil', ' dann', ' aber', ' nur',
  ],
  punctuation: ['.', ',', '!', '?', '\n'],
}

const GERMAN_HINTS = ['ß', 'ü', 'ö', 'ä', ' und ', ' der ', ' die ', ' das ', ' ist ', ' nicht ', ' ein ']

export function looksGerman(text: string): boolean {
  const padded = ` ${text.toLowerCase()} `
  return GERMAN_HINTS.some((hint) => padded.includes(hint))
}
