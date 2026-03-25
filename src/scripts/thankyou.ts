import { trackPurchase } from './pixel';
import { clearAttribution } from './attribution';
import type { TrackingConfig, AttributionData } from './types';

async function start() {
  const attr = window.COS_ATTR || JSON.parse(localStorage.getItem('nilufer_orchestra_attr') || '{}');
  if (window.location.search.includes('cos_debug=true')) (window as any).COS_DEBUG = true;

  try {
    const response = await fetch('/api/config');
    const config: TrackingConfig = await response.json();

    const kartraData = (window as any).kartra_data || {};
    
    trackPurchase(config, attr as AttributionData, {
      transaction_id: kartraData.order_id || 'manual_' + Date.now(),
      value: kartraData.total || 0,
      currency: kartraData.currency || 'TRY',
      items: kartraData.items || []
    });

    // Cleanup session after successful purchase
    clearAttribution();
    
  } catch (e) {
    if ((window as any).COS_DEBUG) console.error('[COS] Thank-you tracking failed', e);
  }
}

start();
