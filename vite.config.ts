// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Serve at https://<user>.github.io/pokemon-trackerv3/
  base: '/pokemon-trackerv3/',

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ⇠ same style as the linktree sample
    },
  },

  // Optional – keeps the output folder and asset directory explicit.
  // Remove if you’re happy with Vite defaults (dist, assets)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
