import { initCOS } from './attribution';
import { initPixels } from './pixel';
import type { ProjectConfig } from './types';

declare global {
    interface Window {
        COS_CONFIG?: ProjectConfig;
        __NILUFER_TRACKER_LOADED__?: boolean;
    }
}

async function start() {
  if (window.__NILUFER_TRACKER_LOADED__ === true) {
    console.warn('[Signal-Path] Tracker already initialized, skipping...');
    return;
  }
  
  const config = window.COS_CONFIG;
  if (!config) return;

  // Mark as loaded before processing
  window.__NILUFER_TRACKER_LOADED__ = true;

  initCOS(config);
  initPixels(config as any, window.COS_ATTR!);
}

start();
