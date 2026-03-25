import { initCOS } from './attribution';
import { initPixels } from './pixel';
import type { ProjectConfig } from './types';

declare global {
    interface Window {
        COS_CONFIG?: ProjectConfig;
    }
}

async function start() {
  const config = window.COS_CONFIG;
  if (!config) return;

  initCOS(config);
  initPixels(config as any, window.COS_ATTR!);
}

start();
