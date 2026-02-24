// Known attention head types from mechanistic interpretability research

export interface HeadType {
  name: string
  what: string
  example: string
  category: string
}

export const KNOWN_HEAD_TYPES: HeadType[] = [
  // === Pattern Matching ===
  {
    name: 'Previous Token Head',
    what: 'Always attends to the token at position i−1.',
    example: '"The cat sat" → "sat" attends to "cat", "cat" attends to "The"',
    category: 'Pattern Matching',
  },
  {
    name: 'Induction Head',
    what: 'Completes patterns. If [A][B] appeared before, then seeing [A] again → predicts [B].',
    example: '"Harry Potter … Harry" → predicts "Potter"',
    category: 'Pattern Matching',
  },
  {
    name: 'Semantic Induction Head',
    what: 'Like an Induction Head, but matches on meaning instead of exact tokens. Captures category and usage relationships.',
    example: '"dog: animal … cat:" → predicts "animal" by matching the semantic relationship',
    category: 'Pattern Matching',
  },
  {
    name: 'Duplicate Token Head',
    what: 'Attends to earlier occurrences of the same token in the sequence.',
    example: '"the cat and the dog" → second "the" attends strongly to first "the"',
    category: 'Pattern Matching',
  },
  {
    name: 'Successor Head',
    what: 'Predicts the next item in an ordered sequence.',
    example: '"Monday, Tuesday, __" → predicts "Wednesday"',
    category: 'Pattern Matching',
  },
  // === Name / Entity Circuit ===
  {
    name: 'Name Mover Head',
    what: 'Copies a name from earlier in the sentence to the output position.',
    example: '"Mary gave a book to John. John gave it back to __" → copies "Mary"',
    category: 'Name Circuit',
  },
  {
    name: 'Backup Name Mover Head',
    what: 'Redundancy mechanism: stays dormant normally but takes over if the main Name Mover Heads fail.',
    example: 'If the primary Name Mover is ablated, this head compensates to still predict "Mary"',
    category: 'Name Circuit',
  },
  {
    name: 'Negative Name Mover Head',
    what: 'Works against the correct answer — actively boosts the wrong name, acting as opposition to Name Mover Heads.',
    example: '"Mary gave to John. John gave back to __" → increases logit of "John" (the wrong answer)',
    category: 'Name Circuit',
  },
  {
    name: 'S-Inhibition Head',
    what: 'Prevents the model from attending to the wrong subject when multiple names are present.',
    example: '"Mary gave to John. John gave back to __" → suppresses "John" so "Mary" wins',
    category: 'Name Circuit',
  },
  {
    name: 'Letter Mover Head',
    what: 'Extracts the first letter of each word to build acronyms at the output position.',
    example: '"National Aeronautics and Space Administration" → attends to N, A, S, A → "NASA"',
    category: 'Name Circuit',
  },
  // === Factual Knowledge ===
  {
    name: 'Retrieval Head',
    what: 'Attends to factual information stated earlier in a long context.',
    example: '"The capital of France is Paris. … What is the capital of France?" → attends to "Paris"',
    category: 'Knowledge',
  },
  {
    name: 'Subject Head',
    what: 'Focuses on the subject entity in a factual query, enriching its representation for downstream processing.',
    example: '"The Eiffel Tower is located in __" → attends strongly to "Eiffel Tower"',
    category: 'Knowledge',
  },
  {
    name: 'Relation Head',
    what: 'Focuses on the relation/predicate in a factual query, encoding what type of information is being asked for.',
    example: '"The Eiffel Tower is located in __" → attends to "located in" to signal a location query',
    category: 'Knowledge',
  },
  {
    name: 'Memory Head',
    what: 'Retrieves facts from the model\'s parametric knowledge (learned during pre-training), not from context.',
    example: '"Who wrote Romeo and Juliet?" → retrieves "Shakespeare" from stored knowledge',
    category: 'Knowledge',
  },
  // === Output Shaping ===
  {
    name: 'Copy Suppression Head',
    what: 'Prevents the model from naively repeating the most recent token.',
    example: 'After generating "the", suppresses "the" so the model picks a noun instead',
    category: 'Output Shaping',
  },
  {
    name: 'Negative Head',
    what: 'Reduces the probability of tokens that already appeared in context. Copy Suppression is one subtype.',
    example: 'After "The cat sat on the", reduces probability of "the", "cat", "sat" to avoid repetition',
    category: 'Output Shaping',
  },
  {
    name: 'Amplification Head',
    what: 'Boosts the signal of the already-selected answer token, making it win over competitors at output time.',
    example: 'After other heads identify answer "B", the Amplification Head magnifies "B"\'s logit to dominate',
    category: 'Output Shaping',
  },
  // === Structural / Positional ===
  {
    name: 'Positional Head',
    what: 'Attends based on fixed position offsets regardless of content. Shows as diagonal stripes in the heatmap.',
    example: 'Token at position 5 always attends to position 1, regardless of what words are there',
    category: 'Structural',
  },
  {
    name: 'Attention Sink Head',
    what: 'Assigns disproportionate attention to the first token (BOS) regardless of content — a "no-op" mechanism that prevents representational collapse.',
    example: 'Across many layers, the BOS token receives 90%+ weight even though it carries no semantic meaning',
    category: 'Structural',
  },
  {
    name: 'Active-Dormant Head',
    what: 'Switches between active (contributing to computation) and dormant (routing all attention to BOS) depending on input domain.',
    example: 'A head activates on code data (attending to syntax tokens) but goes dormant on Wikipedia text',
    category: 'Structural',
  },
  {
    name: 'Streaming Head',
    what: 'Only attends to recent tokens and the attention sink — handles local coherence in long documents.',
    example: 'In a 100,000-token document, only attends to the last few hundred tokens for grammar and flow',
    category: 'Structural',
  },
  {
    name: 'Subword Merge Head',
    what: 'Merges tokenized subword pieces back into a complete word representation.',
    example: '"understanding" → ["under", "standing"] — the head at "standing" attends to "under" to reunify the word',
    category: 'Structural',
  },
  // === Linguistic ===
  {
    name: 'Syntactic Head',
    what: 'Attends along grammatical dependency arcs — subject→verb, verb→object, adjective→noun.',
    example: '"The large cat quickly chased the mouse" → links "chased" to subject "cat" and object "mouse"',
    category: 'Linguistic',
  },
  {
    name: 'Rare Words Head',
    what: 'Consistently attends to the lowest-frequency (rarest) tokens in a sentence. Found in early layers.',
    example: '"The archaeologist discovered a sarcophagus" → highest attention to "sarcophagus" and "archaeologist"',
    category: 'Linguistic',
  },
  {
    name: 'Gender Head',
    what: 'Encodes gender-related information, driving gendered pronoun resolution — sometimes reflecting training biases.',
    example: '"The nurse said __ would help" → biased toward "she" over "he" due to occupational stereotypes',
    category: 'Linguistic',
  },
  {
    name: 'Sentiment Summarizer Head',
    what: 'Aggregates sentiment-expressing words (adjectives, verbs) into a summary signal at one position.',
    example: '"The movie was absolutely terrible and boring" → concentrates negative signal from "terrible" and "boring"',
    category: 'Linguistic',
  },
  // === Numerical / Logic ===
  {
    name: 'Greater-Than Head',
    what: 'Performs numerical comparison between tokens representing numbers.',
    example: '"The war lasted from 1732 to 17__" → suppresses years ≤ 1732',
    category: 'Numerical',
  },
  {
    name: 'Arithmetic Head',
    what: 'Performs addition using trigonometric representations of numbers (the "Clock algorithm").',
    example: '"37 + 25 = __" → manipulates helical number representations to arrive at 62',
    category: 'Numerical',
  },
  // === In-Context Learning ===
  {
    name: 'Function Vector Head',
    what: 'Encodes the abstract task demonstrated by few-shot examples (not just pattern matching — actual task encoding).',
    example: '"hot→cold, big→small" → encodes the "antonym" task, enabling "fast→slow" without exact pattern match',
    category: 'In-Context Learning',
  },
  // === Safety & Alignment ===
  {
    name: 'Safety Head',
    what: 'Contributes to refusal behavior on harmful queries. Ablating these heads degrades safety guardrails.',
    example: 'Harmful prompt → Safety Heads shift output toward "I cannot help with that" instead of complying',
    category: 'Safety',
  },
  {
    name: 'Truthfulness Head',
    what: 'Correlated with truthful outputs. Ablating these heads causes more hallucinated or false answers.',
    example: '"Was the Great Wall visible from space?" → helps output "no" instead of the common misconception',
    category: 'Safety',
  },
  // === Multilingual ===
  {
    name: 'Copy Head (multilingual)',
    what: 'Copies tokens verbatim across languages when translation is not needed (proper nouns, numbers).',
    example: 'Translating "Barack Obama went to Berlin" to French → copies "Barack Obama" and "Berlin" unchanged',
    category: 'Multilingual',
  },
  {
    name: 'Coherence Head',
    what: 'Ensures the output language matches the input language, preventing mid-sentence language switches.',
    example: 'Question asked in French → Coherence Head ensures the answer stays in French throughout',
    category: 'Multilingual',
  },
  {
    name: 'Style Head',
    what: 'Controls response style (formal, casual, technical) without changing the semantic content.',
    example: 'Instructed to be formal → shifts output from "start" to "commence", "get" to "obtain"',
    category: 'Multilingual',
  },
]
