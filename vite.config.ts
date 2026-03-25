import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        global: resolve(__dirname, 'src/scripts/global.ts'),
        thankyou: resolve(__dirname, 'src/scripts/thankyou.ts'),
        admin: resolve(__dirname, 'index.html'), // This is the default in vanilla-ts
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].chunk.js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
