import { describe, expect, it } from 'vitest'
import { tokenize } from '../../model/tokenizer'
import { feedForward } from '../../model/vectors'
import { generateAttentionWeights } from '../../model/attention'
import { attentionLines, columnsAfterRuns, COLUMN_LENGTH, mostChangedIndex, startColumn } from './columns'

const tokens = tokenize('The dog barked because it was hungry.')

describe('feed-forward columns', () => {
  it('makes one column of fixed length per token', () => {
    const columns = columnsAfterRuns(tokens, 0)
    expect(columns).toHaveLength(tokens.length)
    for (const column of columns) expect(column).toHaveLength(COLUMN_LENGTH)
  })

  it('changes every column at once on a run', () => {
    const before = columnsAfterRuns(tokens, 0)
    const after = columnsAfterRuns(tokens, 1)
    after.forEach((column, i) => expect(column).not.toEqual(before[i]))
  })

  it('processes each column alone: a column does not depend on its neighbours', () => {
    const inSentence = columnsAfterRuns(tokens, 2)[3]
    const alone = feedForward(feedForward(startColumn(tokens[3], 3)))
    expect(inSentence).toEqual(alone)
  })

  it('finds the number that moved most', () => {
    expect(mostChangedIndex([0, 0, 0], [0.1, -0.5, 0.2])).toBe(1)
  })
})

describe('attention lines', () => {
  it('only run from earlier to later columns', () => {
    const lines = attentionLines(generateAttentionWeights(tokens, 'pronoun'))
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) expect(line.from).toBeLessThan(line.to)
  })
})
