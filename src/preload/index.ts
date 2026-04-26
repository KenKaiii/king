import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

const api = {
  images: {
    list: (cursor?: string, limit?: number) => ipcRenderer.invoke('images:list', cursor, limit),
    save: (data: { url: string; prompt: string; aspectRatio: string }) =>
      ipcRenderer.invoke('images:save', data),
    delete: (id: string) => ipcRenderer.invoke('images:delete', id),
  },
  generate: {
    image: (data: {
      prompt: string;
      aspectRatio: string;
      resolution: string;
      outputFormat: string;
      imageUrls: string[];
      modelVariant?: 'nano_banana_pro' | 'gpt_image_2';
    }) => ipcRenderer.invoke('generate:image', data),
  },
  files: {
    download: (url: string, filename: string) =>
      ipcRenderer.invoke('files:download', url, filename),
  },
  apiKeys: {
    list: () => ipcRenderer.invoke('apiKeys:list'),
    set: (service: string, key: string) => ipcRenderer.invoke('apiKeys:set', service, key),
    delete: (service: string) => ipcRenderer.invoke('apiKeys:delete', service),
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },
  log: {
    error: (level: string, message: string, stack?: string) =>
      ipcRenderer.invoke('log:error', level, message, stack),
  },
  update: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('updater:getVersion'),
    getStatus: () => ipcRenderer.invoke('updater:getStatus'),
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    /**
     * Subscribe to status broadcasts from the main process. Returns an
     * unsubscribe function.
     */
    onStatus: (callback: (status: unknown) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, status: unknown) => callback(status);
      ipcRenderer.on('updater:status', listener);
      return () => {
        ipcRenderer.removeListener('updater:status', listener);
      };
    },
  },
  adReferences: {
    list: () => ipcRenderer.invoke('adReferences:list'),
    create: (data: {
      file: { name: string; buffer: ArrayBuffer };
      width: number;
      height: number;
      aspectRatio: string;
    }) => ipcRenderer.invoke('adReferences:create', data),
    delete: (id: string) => ipcRenderer.invoke('adReferences:delete', id),
  },
  facebookAds: {
    status: () => ipcRenderer.invoke('facebookAds:status'),
    saveCredentials: (input: {
      accessToken: string;
      defaultAdAccountId?: string;
      defaultPageId?: string;
    }) => ipcRenderer.invoke('facebookAds:saveCredentials', input),
    listAdAccounts: () => ipcRenderer.invoke('facebookAds:listAdAccounts'),
    listPages: () => ipcRenderer.invoke('facebookAds:listPages'),
    listCampaigns: (adAccountId?: string) =>
      ipcRenderer.invoke('facebookAds:listCampaigns', adAccountId),
    listAdSets: (adAccountId?: string, campaignId?: string) =>
      ipcRenderer.invoke('facebookAds:listAdSets', adAccountId, campaignId),
    createAd: (request: {
      adAccountId?: string;
      pageId?: string;
      campaignId?: string;
      newCampaign?: { name: string; objective: string };
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
        ctaType: string;
        status: 'ACTIVE' | 'PAUSED';
      };
      image: { filename: string; bytes: ArrayBuffer };
    }) => ipcRenderer.invoke('facebookAds:createAd', request),
  },
  entities: {
    list: (entityType: string) => ipcRenderer.invoke('entities:list', entityType),
    create: (
      entityType: string,
      data: {
        name: string;
        files: { name: string; buffer: ArrayBuffer }[];
        productType?: string;
      },
    ) => ipcRenderer.invoke('entities:create', entityType, data),
    update: (
      entityType: string,
      id: string,
      data: {
        name: string;
        existingImages: string[];
        newFiles: { name: string; buffer: ArrayBuffer }[];
        productType?: string;
      },
    ) => ipcRenderer.invoke('entities:update', entityType, id, data),
    delete: (entityType: string, id: string) =>
      ipcRenderer.invoke('entities:delete', entityType, id),
  },
};

contextBridge.exposeInMainWorld('api', api);

export type ElectronAPI = typeof api;
