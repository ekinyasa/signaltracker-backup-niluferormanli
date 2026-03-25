import { defineConfig } from 'vite';
import { resolve } from 'path';
import { execSync } from 'child_process';

const getBuildId = () => {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    if (hash.length >= 4) {
      return `${hash.slice(0, 2)}-${hash.slice(-2)}`;
    }
    return hash;
  } catch (e) {
    return 'dev';
  }
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('V2.2'),
    __BUILD_ID__: JSON.stringify(getBuildId()),
  },
  build: {
    rollupOptions: {
      input: {
        admin: resolve(__dirname, 'index.html'),
        header: resolve(__dirname, 'src/scripts/header.ts'),
        checkout: resolve(__dirname, 'src/scripts/checkout.ts'),
        thankyou: resolve(__dirname, 'src/scripts/thankyou.ts'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].chunk.js',
      }
    }
  }
});
