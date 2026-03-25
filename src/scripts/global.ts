import { initCOS } from './attribution';
import { initPixels } from './pixel';
import type { TrackingConfig } from './types';

async function start() {
  // Check for debug mode
  if (window.location.search.includes('cos_debug=true') || localStorage.getItem('COS_DEBUG') === 'true') {
    window.COS_DEBUG = true;
  }

  initCOS();

  // In a real scenario, we would fetch this config from our API
  // For now, we'll use a placeholder or pass it via the loader
  // Let's assume the loader provides basic config or we fetch it
  try {
    const response = await fetch('/api/config');
    const config: TrackingConfig = await response.json();
    
    if (window.COS_ATTR) {
      initPixels(config, window.COS_ATTR);
    }
  } catch (e) {
    if (window.COS_DEBUG) console.error('[COS] Failed to load config', e);
  }
}

start();
