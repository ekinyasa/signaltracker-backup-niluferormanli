import type { TrackingConfig, AttributionData } from './types';

export function initPixels(config: TrackingConfig, attr: AttributionData) {
  // GA4 Initialization
  const gaId = config.gaId;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());

  // GA4 Configuration with Linker and Custom Dimensions
  window.gtag('config', gaId, {
    linker: {
      domains: ['niluferormanli.com', 'niluferormanli.studio']
    },
    campaign_id: attr.cid || '',
    lang: attr.lang || config.defaultLang,
    market: attr.market || config.defaultMarket,
    utm_source: attr.utm_source || '',
    utm_medium: attr.utm_medium || '',
    utm_campaign: attr.utm_campaign || '',
    cos_win: attr.cos_win || ''
  });

  // Meta Pixel Initialization
  const pixelId = config.pixelId;
  const f = window as any;
  const b = document;
  const e = 'script';
  const v = 'https://connect.facebook.net/en_US/fbevents.js';

  if (!f.fbq) {
    const n: any = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = !0;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  }

  window.fbq('init', pixelId, {
    external_id: attr.cid || ''
  });
  window.fbq('track', 'PageView', {
    lang: attr.lang || config.defaultLang,
    market: attr.market || config.defaultMarket
  });

  if (window.COS_DEBUG) console.log('[COS] Pixels Initialized');
}

export function trackPurchase(config: TrackingConfig, attr: AttributionData, data: any) {
  const { value, currency, transaction_id } = data;

  // GA4 Purchase
  window.gtag('event', 'purchase', {
    transaction_id,
    value: parseFloat(value),
    currency,
    items: data.items || [],
    campaign_id: attr.cid || '',
    lang: attr.lang || config.defaultLang,
    market: attr.market || config.defaultMarket
  });

  // Meta Purchase
  window.fbq('track', 'Purchase', {
    value: parseFloat(value),
    currency,
    content_ids: data.content_ids || [],
    content_type: 'product',
    lang: attr.lang || config.defaultLang,
    market: attr.market || config.defaultMarket
  });

  if (window.COS_DEBUG) console.log('[COS] Purchase Event Tracked', data);
}
