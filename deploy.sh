#!/usr/bin/env bash
set -euo pipefail

# AI Explainer - Gates, build and deploy to Cloudflare Pages
# Usage: ./deploy.sh
# Every gate must pass; set -e stops the script at the first failure, so nothing is deployed.

echo "==> Gate 1/4: typecheck"
npm run typecheck

echo "==> Gate 2/4: lint"
npm run lint

echo "==> Gate 3/4: test"
npm run test

echo "==> Gate 4/4: build"
npm run build

echo "==> Deploying to Cloudflare Pages (ai-explainer)..."
wrangler pages deploy ./dist --project-name=ai-explainer

echo "==> Done! Live at https://ai-explorer.franzai.com"
