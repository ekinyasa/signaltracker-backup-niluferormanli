import type { AttributionData } from './types';

const STORAGE_KEY = 'nilufer_orchestra_attr';

export function getAttribution(): AttributionData {
  const urlParams = new URLSearchParams(window.location.search);
  const now = Date.now();

  const newAttr: Partial<AttributionData> = {};
  const params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'lang', 'market', 'cid', 'cos_win'];

  let foundInUrl = false;
  params.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      (newAttr as any)[param] = value;
      foundInUrl = true;
    }
  });

  if (foundInUrl) {
    const data: AttributionData = {
      ...(newAttr as AttributionData),
      timestamp: now
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (window.COS_DEBUG) {
        console.log('[COS] Attribution UPDATED (Last-Click):', data);
    }
    return data;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored) as AttributionData;
      if (window.COS_DEBUG) console.log('[COS] Attribution active:', data);
      return data;
    } catch (e) {
      if (window.COS_DEBUG) console.warn('[COS] Failed to parse stored attribution');
    }
  }

  return { timestamp: now };
}

export function clearAttribution() {
  localStorage.removeItem(STORAGE_KEY);
  if (window.COS_DEBUG) console.log('[COS] Attribution CLEARED (Post-Purchase)');
}

export function initCOS() {
  window.COS_ATTR = getAttribution();
  if (window.COS_DEBUG) {
    console.log('[COS] System Initialized', window.COS_ATTR);
  }
}
