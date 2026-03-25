import { trackPurchase } from './pixel';
import type { TrackingConfig, AttributionData } from './types';

async function start() {
  const attr = window.COS_ATTR || JSON.parse(localStorage.getItem('nilufer_orchestra_attr') || '{}');
  
  try {
    const response = await fetch('/api/config');
    const config: TrackingConfig = await response.json();

    // Map Kartra data if possible
    // Example: window.kartra_data
    const kartraData = (window as any).kartra_data || {};
    
    trackPurchase(config, attr as AttributionData, {
      transaction_id: kartraData.order_id || 'manual_' + Date.now(),
      value: kartraData.total || 0,
      currency: kartraData.currency || 'TRY',
      items: kartraData.items || []
    });
  } catch (e) {
    if (window.COS_DEBUG) console.error('[COS] Thank-you tracking failed', e);
  }
}

start();
