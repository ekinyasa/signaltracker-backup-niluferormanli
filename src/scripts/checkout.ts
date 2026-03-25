import { trackCheckout } from './pixel';
import type { ProjectConfig } from './types';

async function start() {
    const config = (window as any).COS_CONFIG as ProjectConfig;
    if (!config) return;

    const attr = window.COS_ATTR || JSON.parse(localStorage.getItem('nilufer_orchestra_attr') || '{}');

    // Preset check: Minimal mode ignores Meta
    if (config.preset === 'minimal_ga') {
        // Only GA would be initialized by header, so pixel.ts handles exclusions
    }

    const kartraCheckout = (window as any).kartra_checkout || {};
    
    trackCheckout(config as any, attr as any, {
        value: kartraCheckout.total || 0,
        currency: kartraCheckout.currency || 'TRY',
        items: kartraCheckout.items || []
    });
}

start();
