import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works on GitHub Pages under /<repo>/.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // The trade dataset and world atlas are bundled on purpose (about 250 kB gzipped in total).
  build: { chunkSizeWarningLimit: 1200 },
  // In development the embedded Ricardian explorer is served through this origin, so it behaves as on
  // GitHub Pages, where both apps share gwonyongjin94-ui.github.io (same storage, inspectable frame).
  server: {
    proxy: { '/ricardian-model': { target: 'https://gwonyongjin94-ui.github.io', changeOrigin: true } },
  },
})
