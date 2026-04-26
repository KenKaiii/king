export interface GeneratedImageData {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  filename: string;
}

export interface EntityData {
  id: string;
  name: string;
  referenceImages: string[];
  thumbnailUrl: string | null;
  createdAt: string;
  productType?: string;
}

export interface CustomAdReferenceData {
  id: string;
  filename: string;
  url: string;
  aspectRatio: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface ApiKeyEntry {
  maskedKey: string;
  savedAt: string;
}

export interface FbBusinessRef {
  id: string;
  name: string;
}

export interface FbAdAccount {
  id: string;
  name: string;
  currency: string;
  account_status: number;
  business?: FbBusinessRef;
}

export interface FbPage {
  id: string;
  name: string;
}

export interface FbCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
}

export interface FbAdSet {
  id: string;
  name: string;
  campaign_id: string;
  daily_budget?: string;
  status: string;
}

export type FbObjective =
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_APP_PROMOTION';

export type FbCtaType =
  | 'SHOP_NOW'
  | 'LEARN_MORE'
  | 'SIGN_UP'
  | 'DOWNLOAD'
  | 'GET_OFFER'
  | 'BOOK_TRAVEL'
  | 'CONTACT_US';

export interface FbStatusResult {
  connected: boolean;
  defaultAdAccountId?: string;
  defaultPageId?: string;
}

export interface FbCreateAdInput {
  adAccountId?: string;
  pageId?: string;
  campaignId?: string;
  newCampaign?: { name: string; objective: FbObjective };
  adSetId?: string;
  newAdSet?: {
    name: string;
    dailyBudget: number;
    countries: string[];
    ageMin: number;
    ageMax: number;
  };
  ad: {
    name: string;
    headline: string;
    message: string;
    link: string;
    ctaType: FbCtaType;
    status: 'ACTIVE' | 'PAUSED';
  };
  image: { filename: string; bytes: ArrayBuffer };
}

export interface FbCreateAdResult {
  campaignId: string;
  adSetId: string;
  creativeId: string;
  adId: string;
  imageHash: string;
  adAccountId: string;
}

export interface FbSaveCredentialsResult {
  adAccountCount: number;
  pageCount: number;
  defaultAdAccountId?: string;
  defaultPageId?: string;
}

export type UpdaterStage =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdaterStatus {
  stage: UpdaterStage;
  currentVersion: string;
  updateVersion?: string;
  releaseNotes?: string;
  progress?: number;
  bytesPerSecond?: number;
  error?: string;
}

export interface ElectronAPI {
  images: {
    list: (
      cursor?: string,
      limit?: number,
    ) => Promise<{
      data: GeneratedImageData[];
      nextCursor: string | null;
      hasMore: boolean;
    }>;
    save: (data: {
      url: string;
      prompt: string;
      aspectRatio: string;
    }) => Promise<GeneratedImageData>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  generate: {
    image: (data: {
      prompt: string;
      aspectRatio: string;
      resolution: string;
      outputFormat: string;
      imageUrls: string[];
      modelVariant?: 'nano_banana_pro' | 'gpt_image_2';
    }) => Promise<{ success: boolean; resultUrls: string[] }>;
  };
  files: {
    download: (
      url: string,
      filename: string,
    ) => Promise<{ success: boolean; filePath?: string; cancelled?: boolean }>;
  };
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
  log: {
    error: (level: string, message: string, stack?: string) => Promise<void>;
  };
  update: {
    getVersion: () => Promise<string>;
    getStatus: () => Promise<UpdaterStatus>;
    check: () => Promise<UpdaterStatus>;
    download: () => Promise<void>;
    install: () => Promise<void>;
    onStatus: (callback: (status: UpdaterStatus) => void) => () => void;
  };
  apiKeys: {
    list: () => Promise<Record<string, ApiKeyEntry>>;
    set: (service: string, key: string) => Promise<{ success: boolean }>;
    delete: (service: string) => Promise<{ success: boolean }>;
  };
  facebookAds: {
    status: () => Promise<FbStatusResult>;
    saveCredentials: (input: {
      accessToken: string;
      defaultAdAccountId?: string;
      defaultPageId?: string;
    }) => Promise<FbSaveCredentialsResult>;
    listAdAccounts: () => Promise<FbAdAccount[]>;
    listPages: () => Promise<FbPage[]>;
    listCampaigns: (adAccountId?: string) => Promise<FbCampaign[]>;
    listAdSets: (adAccountId?: string, campaignId?: string) => Promise<FbAdSet[]>;
    createAd: (request: FbCreateAdInput) => Promise<FbCreateAdResult>;
  };
  adReferences: {
    list: () => Promise<CustomAdReferenceData[]>;
    create: (data: {
      file: { name: string; buffer: ArrayBuffer };
      width: number;
      height: number;
      aspectRatio: string;
    }) => Promise<CustomAdReferenceData>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  entities: {
    list: (entityType: string) => Promise<EntityData[]>;
    create: (
      entityType: string,
      data: {
        name: string;
        files: { name: string; buffer: ArrayBuffer }[];
        productType?: string;
      },
    ) => Promise<EntityData>;
    update: (
      entityType: string,
      id: string,
      data: {
        name: string;
        existingImages: string[];
        newFiles: { name: string; buffer: ArrayBuffer }[];
        productType?: string;
      },
    ) => Promise<EntityData>;
    delete: (entityType: string, id: string) => Promise<{ success: boolean }>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
  /** App version string, injected at build time from package.json. */
  const __APP_VERSION__: string;
}
