# AI Explainer — How Language Models Generate Text

Interactive 8-step explainer teaching non-technical adults how language models generate text.

## Quick Reference

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Build static site to ./dist
npm run deploy   # Build + deploy to Cloudflare Pages
./deploy.sh      # Same as above (shell script)
```

## Live URLs

| Service | URL |
|---------|-----|
| **App** | https://ai-explorer.franzai.com |
| **Worker API** | https://ai-explainer-api.franz-enzenhofer7308.workers.dev |
| **GitHub** | https://github.com/franzenzenhofer/ai-explainer-app |

## Architecture

```
app/                          # Astro + React frontend
├── src/
│   ├── core/                 # Shared types, hooks, components
│   │   ├── types/index.ts    # MODEL_SPECS, Token, etc.
│   │   ├── hooks/useStep.ts  # Step configs, educational text
│   │   └── components/       # StepLayout (3 modes), controls
│   ├── steps/                # 8 interactive steps (00-07)
│   │   ├── 00-intro/         # Welcome page
│   │   ├── 01-input/         # Text input
│   │   ├── 02-tokenization/  # Real tiktoken (o200k_base)
│   │   ├── 03-embeddings/    # Vector space visualization
│   │   ├── 04-attention/     # Heatmap + network (viz-full)
│   │   ├── 05-prediction/    # Temperature/Top-K/Top-P
│   │   ├── 06-generation/    # Real AI generation (viz-full)
│   │   └── 07-understanding/ # Pattern vs meaning tests
│   ├── store/appStore.ts     # Zustand global state
│   └── services/gemini.ts    # Gemini API client
├── dist/                     # Build output (deployed)
└── deploy.sh                 # Build + deploy script

worker/                       # Cloudflare Worker (Gemini proxy)
├── src/index.ts
└── wrangler.toml
```

## Layout System

StepLayout supports 3 layout modes via the `layout` prop:

| Mode | Grid | Steps |
|------|------|-------|
| `balanced` | 50/50 | Input (1), Understanding (7) |
| `viz-wide` | 35/65 | Tokenization (2), Embeddings (3), Prediction (5) |
| `viz-full` | Full-width viz, compact text above | Attention (4), Generation (6) |

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

- **No GPT-5 branding** — generic "language model" throughout
- **No abbreviations** — LLM, BPE, AI spelled out on first use
- **"substrings" not "subwords"** — clearer for non-technical audience
- **MODEL_SPECS** — 12 layers, 12 heads (realistic, no disclaimer needed)
- **Visualization-first** — Gapminder style, viz is the star
- **All text visible** — no collapsible panels, no hidden content
