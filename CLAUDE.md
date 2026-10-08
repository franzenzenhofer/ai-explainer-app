# AI Explainer - How Language Models Generate Text

Interactive ten-chapter explainer teaching non-technical adults how language models generate text.

## Quick Reference

```bash
npm run dev        # Start dev server (localhost:4321)
npm run typecheck  # astro check (gate 1)
npm run lint       # eslint flat config, typescript-eslint strict + react-hooks (gate 2)
npm run test       # vitest run, includes live calls to the deployed worker (gate 3)
npm run build      # Build static site to ./dist (gate 4)
npm run test:e2e   # Playwright walk of all ten chapters at 1440x900 and 390x844, strict layout checks on; BASE_URL=<url> targets a deployed site
npm run deploy     # Build + deploy to Cloudflare Pages (no gates)
./deploy.sh        # All four gates, then deploy; refuses to deploy when any gate fails
```

## Live URLs

| Service | URL |
|---------|-----|
| **App** | https://ai-explorer.franzai.com |
| **Worker API** | https://ai-explainer-api.franz-enzenhofer7308.workers.dev |
| **GitHub** | https://github.com/franzenzenhofer/ai-explainer-app |

## Architecture

```
app/src/
├── pages/[...chapter].astro  # One static page per chapter route (deep links and reloads work)
├── components/App.tsx        # Picks the chapter, syncs browser history, arrow keys
├── core/
│   ├── chapters/             # Chapter config: route, name, claim, accent, drawer, sources (SSOT)
│   ├── components/           # ChapterLayout, TopBar, ChapterMenu, PromptBar, DepthDrawer,
│   │                         # SourcesLine, VisualFrame + ProvenanceBadge, SentenceTokens, VectorStrip
│   ├── navigation/           # pushState navigation on real URLs, Escape and arrow-key hooks
│   └── types/index.ts        # MODEL_SPECS (GPT-2 small), LARGE_MODEL_SPECS, TOKENIZER_SPECS
├── model/                    # tokenizer (real o200k_base), sampling math, illustrative distribution,
│                             # scripted attention lenses, simulated vectors
├── chapters/<id>/            # home, tokens, numbers, attention, feedforward, layers, scores,
│                             # sampling, loop, reality
├── store/                    # Zustand store + memoized selectors (derived data)
└── services/gemini.ts        # Worker client (OpenRouter proxy)
```

## Chapter Rules

- One claim per chapter (`core/chapters/chapters.ts`), one visual inside `VisualFrame` with a Real
  or Simulated badge, a "Go deeper" drawer closed by default, a Sources line, a Next link.
- Every visual module exports `provenance` and passes it to its `VisualFrame` (content test).
- Text >= 16px, touch targets >= 44px, white background, accent colour only for highlight states.

## Deployment Pipeline

### Frontend (Cloudflare Pages)
```bash
cd app
npm run deploy
# or: ./deploy.sh
```

### Worker API (Cloudflare Workers)
```bash
cd worker
wrangler deploy
```

### Full deploy (both)
```bash
cd app && npm run deploy && cd ../worker && wrangler deploy
```

## Git Workflow

```bash
# Feature branch
git checkout -b feature/description
# ... make changes ...
npm run build                           # Verify build
git add -A && git commit -m "message"
git push -u origin feature/description
gh pr create --title "..." --body "..."

# Direct deploy from main
git checkout main
git pull
npm run deploy
```

## Key Design Decisions

- **No GPT-5 branding** - generic "language model" throughout
- **No abbreviations** - LLM, BPE, AI spelled out on first use
- **"substrings" not "subwords"** - clearer for non-technical audience
- **MODEL_SPECS** - 12 layers, 12 heads (realistic, no disclaimer needed)
- **Visualization-first**: the visual is the screen; depth goes into the drawer
