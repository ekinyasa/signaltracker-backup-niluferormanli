export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  lang?: string;
  market?: string;
  cid?: string;
  cos_win?: string;
  timestamp: number;
}

export interface TrackingConfig {
  gaId: string;
  pixelId: string;
  defaultLang: string;
  defaultMarket: string;
}

declare global {
  interface Window {
    COS_DEBUG?: boolean;
    COS_ATTR?: AttributionData;
    dataLayer: any[];
    fbq: any;
    _fbq: any;
    gtag: (...args: any[]) => void;
  }
}
