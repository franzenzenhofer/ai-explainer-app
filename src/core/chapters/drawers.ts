// Text for every chapter's "Go deeper" drawer. Numbers follow the plan's numbers policy:
// GPT-2 small for the demo model, GPT-3 175B for scale, closed models undisclosed.

import { GPT2_EXPORT, LARGE_MODEL_SPECS, LOOP_MODEL, MODEL_SPECS, TOKENIZER_SPECS } from '../types'
import type { ChapterId, DrawerSection } from './types'

const VOCABULARY = TOKENIZER_SPECS.vocabulary.toLocaleString('en-US')
const DEMO_WIDTH = MODEL_SPECS.embeddingDim.toLocaleString('en-US')
const LARGE_WIDTH = LARGE_MODEL_SPECS.embeddingDim.toLocaleString('en-US')
const EXPORT_SOURCE = `${MODEL_SPECS.modelName} (${GPT2_EXPORT.model}, revision ${GPT2_EXPORT.revision}), exported once by ${GPT2_EXPORT.script} in this app's repository`

export const DRAWERS: Record<ChapterId, DrawerSection[]> = {
  home: [
    {
      heading: 'What a token is, in one line',
      paragraphs: [
        'A token is a piece of text from a fixed list: a whole word, part of a word, a space plus a word, or a punctuation mark. The next chapter shows how your own text is cut into them.',
      ],
    },
    {
      heading: 'What one press does here',
      paragraphs: [
        `The first press sends your text to ${LOOP_MODEL.name}, a real open language model (${LOOP_MODEL.id}). It answers with its next ${LOOP_MODEL.stepsPerCall} picks at once and, for every pick, the ${LOOP_MODEL.candidatesPerStep} tokens it found most likely with their real probabilities. Later presses show the next step of that answer; inside the model, each step was a separate run of the machine.`,
        'The model always takes its top token here (temperature 0), so the same text gives the same picks. If you tap another candidate, your token replaces the pick and the next press asks the model about the new text.',
      ],
    },
    {
      heading: 'What is hidden and what is not',
      paragraphs: [
        `Special tokens that look like <|...|>, for example the end-of-turn marker, are hidden from the candidate lists. If one is the model's own pick, the loop stops there and says so. The probability that goes to such markers and to everything else outside the list is shown as "all other tokens". ${LOOP_MODEL.name} has its own token list, so some candidates are pieces of words.`,
        'The demo allows a limited number of live calls per visit and the server limits requests per minute. When a limit is reached, or the model provider does not return probabilities, the page says so and shows no numbers.',
      ],
    },
  ],
  tokens: [
    {
      heading: 'How the list was built',
      paragraphs: [
        'The list comes from byte pair encoding. Start from single bytes, find the pair that occurs most often in a large amount of text, merge it into one new token, and repeat until the list has the size you want.',
        `This app uses ${TOKENIZER_SPECS.name}, the tokenizer OpenAI publishes for ${TOKENIZER_SPECS.publishedFor}. It has ${VOCABULARY} regular tokens, so "about 200,000" is right for this tokenizer. Other models use other lists.`,
      ],
    },
    {
      heading: 'What this costs',
      paragraphs: [
        'The model never sees letters, only token IDs. Questions about letters, such as how many r are in a word, ask about something the model only sees indirectly. That is one reason models miscount letters.',
        'Rare words, other languages and code are split into more tokens than common English words, so the same text costs more tokens.',
      ],
    },
  ],
  numbers: [
    {
      heading: 'How the table is learned',
      paragraphs: [
        'Nobody writes these numbers by hand. They start random and are nudged during training, millions of times, so that the model predicts the next token better. Tokens that are used in similar ways end up with similar lists of numbers.',
      ],
    },
    {
      heading: 'Position',
      paragraphs: [
        'The same token gets the same list wherever it stands. To tell the model where a token stands, a second list of numbers that encodes the position is added to it.',
      ],
    },
    {
      heading: 'Where these numbers come from',
      paragraphs: [
        `They are real: the token-embedding table of ${EXPORT_SOURCE}. The demo keeps 2,980 common whole words, each stored as 768 whole numbers from -127 to 127 plus one scale per token; decoded values are within 0.005 of the originals. The map and the similar-token lists were computed from the original values, not the stored ones.`,
        `${MODEL_SPECS.modelName} has its own token list and splits text slightly differently from the tokenizer in the Tokens chapter. Tokens that are not in the demo set, such as a sentence-initial word without a leading space, a word piece or a symbol, are shown in grey and get no list.`,
      ],
    },
    {
      heading: 'How long the lists are',
      paragraphs: [
        `${MODEL_SPECS.modelName}, the demo model: ${DEMO_WIDTH} numbers per token. ${LARGE_MODEL_SPECS.modelName}: ${LARGE_WIDTH}. The sizes of current closed models such as ChatGPT, Claude and Gemini are not published.`,
      ],
    },
  ],
  attention: [
    {
      heading: 'Query, key and value in three sentences',
      paragraphs: [
        'Each position makes a query: what am I looking for? Each earlier position offers a key: what do I contain? and a value: what I pass on if picked.',
        'The query is compared with every earlier key, the scores are turned into weights that add up to 1, and the values are mixed with those weights.',
        'The mix is added to the position\'s own list of numbers. Positions after it are blocked, so the model can never peek ahead.',
      ],
    },
    {
      heading: 'Heads',
      paragraphs: [
        `Several of these lookups, called heads, run side by side; ${MODEL_SPECS.modelName} has ${MODEL_SPECS.headsPerLayer} per layer. Each head can learn a different pattern. The lenses above show four patterns that researchers have found; the weights here are scripted, not measured.`,
      ],
    },
  ],
  feedforward: [
    {
      heading: 'Two matrix products and a clip',
      paragraphs: [
        'The feed-forward step multiplies each position\'s list of numbers by a big matrix, clips every negative result to zero, and multiplies by a second matrix. The result is added back to the list.',
        'The same two matrices are used for every position, and no position looks at another one in this step. That is the difference to attention.',
      ],
    },
    {
      heading: 'Where facts seem to live',
      paragraphs: [
        'About two thirds of the parameters of a model like GPT-3 sit in these feed-forward steps. Researchers find that stored facts seem to live here, not in a database that is looked up at run time.',
      ],
    },
  ],
  layers: [
    {
      heading: 'The residual stream',
      paragraphs: [
        'Each position keeps one running list of numbers from start to finish. Every attention step and every feed-forward step reads it and adds its result to it.',
        'Nothing is replaced. After the last block the list is the sum of the original token and position numbers and every block\'s contribution.',
      ],
    },
    {
      heading: 'Where these numbers come from',
      paragraphs: [
        `They are real: the running vector at the last position, taken from ${EXPORT_SOURCE}, for four sample prompts. Entry 0 is the token plus position numbers; entry k is the raw output of block k, before any normalisation.`,
        `${MODEL_SPECS.modelName} splits text slightly differently from the tokenizer in the Tokens chapter, so the pieces shown above the numbers are its own. A prompt outside the four samples gets no numbers rather than invented ones.`,
      ],
    },
    {
      heading: 'How many blocks',
      paragraphs: [
        `${MODEL_SPECS.modelName}: ${MODEL_SPECS.layers} blocks. ${LARGE_MODEL_SPECS.modelName}: ${LARGE_MODEL_SPECS.layers}. Current closed models do not publish their size.`,
      ],
    },
  ],
  scores: [
    {
      heading: 'The unembedding',
      paragraphs: [
        `The final list of numbers at the last position is compared with one stored list per token in the vocabulary. That gives one raw score, called a logit, for every token. The tokenizer in the Tokens chapter has ${VOCABULARY}; ${LOOP_MODEL.name} has a vocabulary of its own.`,
      ],
    },
    {
      heading: 'From scores to probabilities',
      paragraphs: [
        'Softmax turns the raw scores into probabilities: every one becomes positive and together they add up to 1. A higher score always means a higher probability.',
        'Every token gets a probability, even absurd ones. Most of them are tiny, but together the long tail is not nothing.',
      ],
    },
    {
      heading: 'Where the bars come from',
      paragraphs: [
        `They are real: ${LOOP_MODEL.name} (${LOOP_MODEL.id}) reports the log-probabilities of its ${LOOP_MODEL.candidatesPerStep} most likely tokens for each step, and the page converts them to probabilities. The last bar is 1 minus their sum. Special tokens that look like <|...|> are not listed, so their share counts in the last bar. Press Ask the model once per text; the answer is kept for the visit.`,
      ],
    },
  ],
  sampling: [
    {
      heading: 'Why not always take the top token',
      paragraphs: [
        'Always taking the most likely token is called greedy decoding. Holtzman and colleagues showed that it leads to text that is bland and strangely repetitive, and proposed top-p (nucleus) sampling: cut off the unreliable tail and roll among the rest.',
      ],
    },
    {
      heading: 'Settings of the picker, not of the model',
      paragraphs: [
        'Temperature, top-k and top-p change how the token is picked from the list. They do not change the model or what it knows. Temperature 0 is not a truth mode: it always takes the top token, right or wrong.',
      ],
    },
    {
      heading: 'What runs where',
      paragraphs: [
        `The ${LOOP_MODEL.candidatesPerStep} probabilities come from ${LOOP_MODEL.name}. The settings and the rolls run in your browser on those numbers only: the real picker of a service works on its whole vocabulary, here the tiny tail outside the list is left out and the rest is rescaled to add up to 1.`,
      ],
    },
  ],
  loop: [
    {
      heading: 'When it stops',
      paragraphs: [
        'The loop stops when the model picks a special end token or when a length limit is reached. In this demo the limit is 30 tokens.',
      ],
    },
    {
      heading: 'Why it streams',
      paragraphs: [
        'Each token needs a full run of the model on everything before it, so the answer can only exist one piece at a time. Streaming shows you the pieces as they are made.',
        'The context window is the most text the model can read in one run. Anything older falls out of view.',
      ],
    },
  ],
  reality: [
    {
      heading: 'Two positions in a real debate',
      paragraphs: [
        'One side calls language models stochastic parrots: they stitch together patterns from their training text without meaning. Some researchers dispute that they merely parrot their training data.',
        'Interpretability work traced what happens inside one model while it adds two numbers: it computed a rough answer and the last digit in parallel paths. Asked how it did it, the model described the school method with carrying. Its story about its own steps did not match what it did.',
      ],
    },
    {
      heading: 'What is safe to say',
      paragraphs: [
        'A language model predicts the next token, again and again. A likely token is not the same as a true one, and the model\'s explanation of its own steps is not evidence of how it got there. Whether this adds up to understanding is still argued about.',
      ],
    },
  ],
}
