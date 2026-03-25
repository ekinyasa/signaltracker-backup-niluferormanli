import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        header: resolve(__dirname, 'src/scripts/header.ts'),
        checkout: resolve(__dirname, 'src/scripts/checkout.ts'),
        thankyou: resolve(__dirname, 'src/scripts/thankyou.ts'),
        admin: resolve(__dirname, 'index.html'),
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
