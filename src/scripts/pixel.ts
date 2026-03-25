import type { TrackingConfig, AttributionData } from './types';

export function initPixels(config: TrackingConfig, attr: AttributionData) {
  // 1. Meta Domain Verification (JS Injection for Kartra Compatibility)
  const fbVerifyId = (config as any).fbVerifyId;
  if (fbVerifyId) {
    const meta = document.createElement('meta');
    meta.name = 'facebook-domain-verification';
    meta.content = fbVerifyId;
    document.head.appendChild(meta);
  }

  // 2. GA4 Initialization (Standard GTAG snippet logic)
  const gaId = config.gaId;
  if (gaId) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    window.gtag('config', gaId, {
      linker: {
        domains: [(config as any).siteDomain || 'niluferormanli.studio', 'niluferormanli.com']
      },
      campaign_id: attr.cid || '',
      lang: attr.lang || config.defaultLang,
      market: attr.market || config.defaultMarket,
      utm_source: attr.utm_source || '',
      utm_medium: attr.utm_medium || '',
      utm_campaign: attr.utm_campaign || '',
      cos_win: attr.cos_win || ''
    });
  }

  // 3. Meta Pixel Initialization (Standard FBQ snippet logic)
  const pixelId = config.pixelId;
  const isMinimal = (config as any).preset === 'minimal_ga';
  
  if (pixelId && !isMinimal) {
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
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        document.head.appendChild(t);
      }
    }

    window.fbq('init', pixelId, {
      external_id: attr.cid || ''
    });
    window.fbq('track', 'PageView');

    // Noscript Fallback Image (JS-based for verification proof)
    const noscriptImg = document.createElement('img');
    noscriptImg.height = 1;
    noscriptImg.width = 1;
    noscriptImg.style.display = 'none';
    noscriptImg.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    document.body.appendChild(noscriptImg);
  }

  if (window.COS_DEBUG) {
      console.log('[COS] Tracking Standardized (V2.4) for Project:', (config as any).name);
  }
}

export function trackCheckout(_config: TrackingConfig, attr: AttributionData, data: any) {
  // GA4
  window.gtag('event', 'begin_checkout', {
    value: parseFloat(data.value || 0),
    currency: data.currency || 'TRY',
    items: data.items || [],
    campaign_id: attr.cid || ''
  });

  // Meta
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
        value: parseFloat(data.value || 0),
        currency: data.currency || 'TRY',
        content_ids: data.items?.map((i: any) => i.id) || [],
        content_type: 'product'
    });
  }
}

export function trackPurchase(_config: TrackingConfig, attr: AttributionData, data: any) {
  const { value, currency, transaction_id } = data;

  // GA4
  window.gtag('event', 'purchase', {
    transaction_id,
    value: parseFloat(value),
    currency,
    items: data.items || [],
    campaign_id: attr.cid || ''
  });

  // Meta
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
        value: parseFloat(value),
        currency,
        content_ids: data.items?.map((i: any) => i.id) || [],
        content_type: 'product',
        external_id: attr.cid || ''
    });
  }
}
