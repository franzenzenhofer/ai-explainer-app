// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // One HTML file per chapter (tokens.html), so Cloudflare Pages serves /tokens without a 308 hop.
  build: { format: 'file' },
  trailingSlash: 'never',

  vite: {
    plugins: [tailwindcss()]
  }
});