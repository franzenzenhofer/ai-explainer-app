// The explanation every slide shows on screen (what, how, why). It brings back the old app's
// WHAT / HOW / WHY cards and info boxes, condensed and corrected to the claims of plan section 3.

import { LARGE_MODEL_SPECS, MODEL_SPECS } from '../types'
import type { ChapterId, Explanation } from './types'

const DEMO = MODEL_SPECS.modelName

export const EXPLANATIONS: Record<ChapterId, Explanation> = {
  intro: {
    what: 'A language model is a token machine: text goes in, one new piece of text comes out.',
    how: 'Nine stages turn your text into a probability for every possible next token, pick one and append it.',
    why: 'Each slide shows one stage, in its own colour, with real data wherever it exists.',
  },
  home: {
    what: 'A language model has one job: read the text so far and predict the next small piece of text, a token.',
    how: 'It gives every possible next token a probability, picks one, adds it to the end and runs again on the longer text.',
    why: 'Writing, answering and translating all come from repeating this one loop.',
  },
  tokens: {
    what: 'The model never sees letters. Your text is cut into tokens: whole words, pieces of words, spaces with a word, punctuation.',
    how: 'Each token is an entry in a fixed list of about 200,000 and has an ID number. Common words are one token; long or rare words fall apart into several.',
    why: 'Tokens are the only thing the model reads and predicts. It sees pieces, not letters, which is why counting letters is hard for it.',
  },
  numbers: {
    what: `Each token ID is swapped for a fixed list of numbers, a vector. In ${DEMO}, the demo model, it has ${MODEL_SPECS.embeddingDim} numbers.`,
    how: 'The lists are learned in training: tokens used in similar places end up with similar lists. A second list that encodes the position is added.',
    why: 'The model cannot compute with letters, only with numbers. From here on everything is arithmetic on these lists.',
  },
  attention: {
    what: 'Each position gathers information from the positions before it, never from the ones after it.',
    how: 'Score: how relevant is each earlier token? Weight: the scores become shares that add up to 100%. Mix: the earlier tokens\' information is blended by those shares.',
    why: 'This is how "it" can pick up "dog" from earlier in the sentence. Many heads do this side by side, each with its own pattern.',
  },
  feedforward: {
    what: 'After attention, each position is processed on its own by the same small network.',
    how: 'The column of numbers is multiplied by one matrix, negatives are clipped to zero, a second matrix follows, and the result is added back to the column.',
    why: 'Attention moves information between positions; the feed-forward step works on what each position now holds. Research links it to stored facts.',
  },
  layers: {
    what: `Attention plus feed-forward is one block. ${DEMO} stacks ${MODEL_SPECS.layers} blocks, ${LARGE_MODEL_SPECS.modelName} stacks ${LARGE_MODEL_SPECS.layers}.`,
    how: 'Every block reads the running list of numbers at each position and adds its result to it. Nothing is replaced, only added.',
    why: 'Later blocks build on what earlier blocks found. The last position\'s list after the top block is what gets scored.',
  },
  scores: {
    what: 'The last position\'s vector is compared with every token in the vocabulary: one score per token.',
    how: 'Softmax turns the scores into probabilities that add up to 100%. A handful of tokens get most of it; all the others share the rest.',
    why: 'This list is the heart of the machine: one probability for every possible next token.',
  },
  sampling: {
    what: 'A token is picked from the list by a weighted roll: likely tokens come up often, unlikely ones sometimes.',
    how: 'Temperature sharpens or flattens the list. Top-k keeps the k most likely tokens. Top-p keeps the smallest top set that adds up to p.',
    why: 'That is why the same text can get different answers. Temperature 0 always takes the top token.',
  },
  loop: {
    what: 'The picked token is added to the end of the text, and the whole machine runs again on the longer text.',
    how: 'Tokens, numbers, attention, feed-forward, every block, scores and the pick: all of it runs once for every new token.',
    why: 'That is why answers appear piece by piece. No finished answer is stored anywhere; each token is chosen in its own run.',
  },
  reality: {
    what: 'The model picks likely tokens. Likely is not the same as true.',
    how: 'Fluent, confident text comes out because such text was likely in the training data, not because a fact was checked.',
    why: 'When it is wrong it is still doing its one job. Its story about how it found an answer is more generated text, not evidence of its steps.',
  },
}
