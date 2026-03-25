import { trackCheckout } from './pixel';
import type { TrackingConfig, AttributionData } from './types';

async function start() {
    const attr = window.COS_ATTR || JSON.parse(localStorage.getItem('nilufer_orchestra_attr') || '{}');
    if (window.location.search.includes('cos_debug=true')) window.COS_DEBUG = true;

    try {
        const response = await fetch('/api/config');
        const config: TrackingConfig = await response.json();

        // Map Kartra checkout data if available
        const kartraCheckout = (window as any).kartra_checkout || {};
        
        trackCheckout(config, attr as AttributionData, {
            value: kartraCheckout.total || 0,
            currency: kartraCheckout.currency || 'TRY',
            items: kartraCheckout.items || []
        });
    } catch (e) {
        if (window.COS_DEBUG) console.error('[COS] Checkout Tracking Failed', e);
    }
}

start();
