import { initCOS } from './attribution';
import { initPixels } from './pixel';
import type { TrackingConfig } from './types';

async function start() {
  if (window.location.search.includes('cos_debug=true') || localStorage.getItem('COS_DEBUG') === 'true') {
    window.COS_DEBUG = true;
  }

  initCOS();

  try {
    const response = await fetch('/api/config');
    const config: TrackingConfig = await response.json();
    
    if (window.COS_ATTR) {
      initPixels(config, window.COS_ATTR);
    }
  } catch (e) {
    if (window.COS_DEBUG) console.error('[COS] Header Config Load Failed', e);
  }
}

start();
