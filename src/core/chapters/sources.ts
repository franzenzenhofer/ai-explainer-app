// Every source the UI cites. Each URL comes from section 3 of the next-iteration plan (read and verified
// there) or was fetched and read in the session that added it; the comment names which.

export interface Source {
  label: string
  url: string
}

export const SOURCES = {
  // Plan section 3, concept 1 and 9
  gptLoop: {
    label: '3Blue1Brown, But what is a GPT',
    url: 'https://www.3blue1brown.com/lessons/gpt#:~:text=repeated%20prediction%20and%20sampling',
  },
  gpt3Abstract: {
    label: 'Brown et al. 2020, GPT-3 abstract',
    url: 'https://arxiv.org/abs/2005.14165#:~:text=autoregressive%20language%20model',
  },
  gpt3Table: {
    label: 'GPT-3 paper, Table 2.1 (model sizes)',
    url: 'https://arxiv.org/pdf/2005.14165',
  },
  nanoGpt: {
    label: 'Karpathy, nanoGPT',
    url: 'https://github.com/karpathy/nanoGPT#:~:text=300%2Dline%20GPT%20model%20definition',
  },
  // Plan section 3, concept 2
  tiktoken: {
    label: 'OpenAI, tiktoken',
    url: 'https://github.com/openai/tiktoken#:~:text=reversible%20and%20lossless',
  },
  sennrich: {
    label: 'Sennrich, Haddow, Birch 2016',
    url: 'https://aclanthology.org/P16-1162.pdf',
  },
  minbpe: {
    label: 'Karpathy, minbpe',
    url: 'https://github.com/karpathy/minbpe#:~:text=byte%2Dlevel',
  },
  // Plan section 3, concept 3
  gptVectors: {
    label: '3Blue1Brown, tokens become vectors',
    url: 'https://www.3blue1brown.com/lessons/gpt#:~:text=12%2C288%20dimensions',
  },
  vaswaniPosition: {
    label: 'Vaswani et al. 2017, section 3.5',
    url: 'https://arxiv.org/html/1706.03762v7#:~:text=relative%20or%20absolute%20position%20of%20the%20tokens',
  },
  // Plan section 3, concept 4
  vaswaniMask: {
    label: 'Vaswani et al. 2017, section 3.1',
    url: 'https://arxiv.org/html/1706.03762v7#:~:text=prevent%20positions%20from%20attending%20to%20subsequent%20positions',
  },
  attentionMask: {
    label: '3Blue1Brown, Attention in transformers',
    url: "https://www.3blue1brown.com/lessons/attention#:~:text=later%20tokens%20don't%20influence%20earlier%20ones",
  },
  circuitsFramework: {
    label: 'Elhage et al. 2021, A Mathematical Framework for Transformer Circuits',
    url: 'https://transformer-circuits.pub/2021/framework/index.html',
  },
  inductionHeads: {
    label: 'Olsson et al. 2022, induction heads',
    url: 'https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html#:~:text=pair%20of%20attention%20heads%20in%20different%20layers',
  },
  // Fetched and read in this session (2026-10-08): the same paper, the sentence that names the previous token head
  previousTokenHead: {
    label: 'Olsson et al. 2022, previous token head',
    url: 'https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html#:~:text=copies%20information%20from%20the%20previous%20token',
  },
  // Fetched and read in this session (2026-10-08): Wang et al. 2022, IOI circuit in GPT-2 small
  duplicateTokenHeads: {
    label: 'Wang et al. 2022, duplicate token heads',
    url: 'https://arxiv.org/html/2211.00593#:~:text=Duplicate%20Token%20Heads%20identify%20tokens%20that%20have%20already%20appeared',
  },
  // Fetched and read in this session (2026-10-08): Vaswani et al. Figure 4 caption
  vaswaniAnaphora: {
    label: 'Vaswani et al. 2017, Figure 4',
    url: 'https://arxiv.org/html/1706.03762v7#:~:text=apparently%20involved%20in%20anaphora%20resolution',
  },
  // Fetched and read in this session (2026-10-08): Xiao et al. 2023 abstract
  attentionSinks: {
    label: 'Xiao et al. 2023, attention sinks',
    url: 'https://arxiv.org/abs/2309.17453#:~:text=strong%20attention%20scores%20towards%20initial%20tokens',
  },
  // Plan section 3, concept 5
  vaswaniFeedForward: {
    label: 'Vaswani et al. 2017, section 3.3',
    url: 'https://arxiv.org/html/1706.03762v7#:~:text=applied%20to%20each%20position%20separately%20and%20identically',
  },
  mlpFacts: {
    label: '3Blue1Brown, How might LLMs store facts',
    url: "https://www.3blue1brown.com/lessons/mlp#:~:text=don't%20exchange%20information",
  },
  // Plan section 3, concept 6
  vaswaniResidual: {
    label: 'Vaswani et al. 2017, section 3.1 (residual)',
    url: 'https://arxiv.org/html/1706.03762v7#:~:text=around%20each%20of%20the%20two%20sub%2Dlayers',
  },
  residualStream: {
    label: 'Elhage et al. 2021, the residual stream',
    url: 'https://transformer-circuits.pub/2021/framework/index.html#:~:text=The%20residual%20stream%20is%20simply%20the%20sum',
  },
  gpt3Layers: {
    label: '3Blue1Brown, GPT-3 has 96 layers',
    url: 'https://www.3blue1brown.com/lessons/attention#:~:text=96%20distinct%20layers',
  },
  // Plan section 3, concept 7
  vaswaniSoftmax: {
    label: 'Vaswani et al. 2017, section 3.4',
    url: 'https://arxiv.org/html/1706.03762v7#:~:text=predicted%20next%2Dtoken%20probabilities',
  },
  unembedding: {
    label: '3Blue1Brown, the unembedding matrix',
    url: 'https://www.3blue1brown.com/lessons/gpt#:~:text=unembedding%20matrix',
  },
  // Plan section 3, concept 8
  nucleusSampling: {
    label: 'Holtzman et al. 2019, nucleus sampling',
    url: 'https://arxiv.org/abs/1904.09751#:~:text=Nucleus%20Sampling',
  },
  temperature: {
    label: '3Blue1Brown, temperature',
    url: 'https://www.3blue1brown.com/lessons/gpt#:~:text=temperature',
  },
  openRouterParameters: {
    label: 'OpenRouter, sampling parameters',
    url: 'https://openrouter.ai/docs/api-reference/parameters',
  },
  // Plan section 3, concept 10
  biologyAddition: {
    label: 'Anthropic 2025, On the Biology of a Large Language Model',
    url: 'https://transformer-circuits.pub/2025/attribution-graphs/biology.html#:~:text=rough%20precision%20in%20parallel',
  },
  stochasticParrot: {
    label: 'Wikipedia, Stochastic parrot',
    url: 'https://en.wikipedia.org/wiki/Stochastic_parrot#:~:text=dispute%20the%20notion',
  },
} as const satisfies Record<string, Source>

export type SourceKey = keyof typeof SOURCES
