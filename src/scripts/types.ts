export type PresetType = 'kartra_standard' | 'simple_landing' | 'minimal_ga';

export interface ProjectConfig {
    id: string;
    name: string;
    siteDomain: string;
    scriptDomain: string;
    backupDomain: string;
    backupWebhook?: string;
    backupDeployKey?: string;
    gaId?: string;
    pixelId?: string;
    fbVerifyId?: string;
    defaultLang: string;
    defaultMarket: string;
    ttlDays: number;
    attributionModel: 'last_click' | 'last_non_direct';
    debugMode: boolean;
    preset: PresetType;
    activeVersion: string;
    versions: ProjectVersion[];
}

export interface ProjectVersion {
    id: string; // e.g. "v1", "v2"
    timestamp: number;
    config: Partial<ProjectConfig>;
}

export interface AttributionData {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
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
        COS_ATTR?: AttributionData;
        COS_DEBUG?: boolean;
        dataLayer: any[];
        gtag: (...args: any[]) => void;
        fbq: any;
        _fbq: any;
    }
}
