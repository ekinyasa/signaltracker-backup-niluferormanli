import { trackPurchase } from './pixel';
import { clearAttribution } from './attribution';
import type { ProjectConfig } from './types';

async function start() {
  const config = (window as any).COS_CONFIG as ProjectConfig;
  if (!config) return;

  const attr = window.COS_ATTR || JSON.parse(localStorage.getItem('nilufer_orchestra_attr') || '{}');

  const kartraData = (window as any).kartra_data || {};
  
  trackPurchase(config as any, attr as any, {
    transaction_id: kartraData.order_id || 'manual_' + Date.now(),
    value: kartraData.total || 0,
    currency: kartraData.currency || 'TRY',
    items: kartraData.items || []
  });

  // Cleanup session after successful purchase
  clearAttribution();
}

start();
