// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // CI passes BASE_URL="/pokemon-trackerv3/"
  const base = process.env.BASE_URL || '/pokemon-trackerv3/';
  return {
    base,
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };
});
