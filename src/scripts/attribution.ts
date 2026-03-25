import type { AttributionData, ProjectConfig } from './types';

const STORAGE_KEY = 'nilufer_orchestra_attr';

export function getAttribution(config?: ProjectConfig) {
  const urlParams = new URLSearchParams(window.location.search);
  const params = ['utm_source', 'utm_medium', 'utm_campaign', 'lang', 'market', 'cid', 'cos_win'];
  const now = Date.now();
  const ttl = (config?.ttlDays || 7) * 24 * 60 * 60 * 1000;

  let newAttr: Partial<AttributionData> = {};
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
    return data;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored) as AttributionData;
      // Check TTL
      if (now - data.timestamp > ttl) {
          localStorage.removeItem(STORAGE_KEY);
          return { timestamp: now };
      }
      return data;
    } catch (e) {
      if (window.COS_DEBUG) console.warn('[COS] Parse error');
    }
  }

  return { timestamp: now };
}

export function clearAttribution() {
  localStorage.removeItem(STORAGE_KEY);
}

export function initCOS(config?: ProjectConfig) {
  if (window.location.search.includes('cos_debug=true')) window.COS_DEBUG = true;
  window.COS_ATTR = getAttribution(config);
}
