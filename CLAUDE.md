# AI Explainer - How Language Models Generate Text

Interactive eleven-slide presentation teaching non-technical adults how language models generate text.

## Quick Reference

```bash
npm run dev -- --port 4391  # Start dev server
npm run typecheck  # astro check (gate 1)
npm run lint       # eslint flat config, typescript-eslint strict + react-hooks (gate 2)
npm run test       # vitest run, includes live calls to the deployed worker (gate 3)
npm run build      # Build static site to ./dist (gate 4)
npm run test:e2e   # Playwright walk of all eleven slides at 1280x720, 1440x900, 1920x1080 and 390x844, strict fit checks on; BASE_URL=<url> targets a deployed site
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
├── pages/[...chapter].astro  # One static page per slide route (deep links and reloads work)
├── layouts/Layout.astro      # Sets html[data-mode] (stage or flow) and --stage-scale before first paint
├── components/App.tsx        # Picks the slide, syncs history, presentation keys, MotionConfig
├── core/
│   ├── colors.ts             # SSOT for colour: concept colour per pipeline stage + token identity colours
│   ├── chapters/             # Slide config (route, claim, stage, explanation, colour key, drawer, sources),
│   │                         # pipeline.ts (the nine stages), explanations.ts, colorKeys.ts
│   ├── components/           # SlideStage (scaled 1280x720 canvas), SlideLayout, PipelineBar, SlideNav,
│   │                         # SidePanel + ColorKey, Overlay, VisualFrame + ProvenanceBadge, TokenChip,
│   │                         # SentenceTokens, VectorStrip, PromptBar, FullscreenButton
│   ├── navigation/           # pushState navigation, presentation keys, full screen, Escape
│   └── types/index.ts        # MODEL_SPECS (GPT-2 small), LARGE_MODEL_SPECS, TOKENIZER_SPECS, LOOP_MODEL
├── model/                    # tokenizer (real o200k_base), merge ranks, GPT-2 tables, sampling math,
│                             # scripted attention lenses, loop steps
├── chapters/<id>/            # intro, home (/machine), tokens, numbers, attention, feedforward, layers,
│                             # scores, sampling, loop, reality
├── store/                    # Zustand store + memoized selectors (derived data)
└── services/                 # Worker clients
```

## Slide Rules

- One slide = one viewport: a 1280x720 canvas scaled to fit the window (letterboxed), in browser full
  screen too. Windows smaller than 1280x720 (and phones) get flow mode: the slide reflows and scrolls,
  text never shrinks below 16px.
- Keys: Right / Space / Page Down next, Left / Page Up back, F full screen, Escape closes overlays.
- Every slide: pipeline bar (you are here + legend), claim as title, visual on the left two thirds,
  What / How / Why plus colour key on the right third, "Go deeper" and "Sources" as overlays.
- Two colour codings, both from `core/colors.ts`: concept colours (tokens blue, numbers violet,
  attention orange, feed-forward green, layers teal, scores rose, pick amber, loop indigo, text slate)
  and token identity colours (same token text, same colour, on every slide; chips show the token ID).
- Every visual module exports `provenance` and passes it to its `VisualFrame` (content test).
- Text >= 16px, touch targets >= 44px, light theme only, motion respects prefers-reduced-motion.

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
- **Visualization-first**: the visual is the slide; the long tail goes into the Go deeper overlay
