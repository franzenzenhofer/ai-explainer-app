#!/usr/bin/env bash
set -euo pipefail

# AI Explainer — Build & Deploy to Cloudflare Pages
# Usage: ./deploy.sh

echo "==> Building..."
npm run build

echo "==> Deploying to Cloudflare Pages (ai-explainer)..."
wrangler pages deploy ./dist --project-name=ai-explainer

echo "==> Done! Live at https://ai-explorer.franzai.com"
