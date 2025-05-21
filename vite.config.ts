import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Complete Vite configuration for GitHub Pages
export default defineConfig({
  // 👇 MUST match the repo name (including the leading and trailing slashes)
  base: '/pokemon-trackerv3/',

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames(assetInfo) {
          const ext = assetInfo.name.split('.').pop()!;
          if (/(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(ext))
            return 'assets/images/[name][extname]';
          if (ext === 'json')
            return 'assets/data/[name][extname]';
          return 'assets/[ext]/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
