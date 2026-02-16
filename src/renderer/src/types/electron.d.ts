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
}

export interface ApiKeyEntry {
  maskedKey: string;
  savedAt: string;
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
    }) => Promise<{ success: boolean; resultUrls: string[] }>;
  };
  files: {
    download: (
      url: string,
      filename: string,
    ) => Promise<{ success: boolean; filePath?: string; cancelled?: boolean }>;
  };
  apiKeys: {
    list: () => Promise<Record<string, ApiKeyEntry>>;
    set: (service: string, key: string) => Promise<{ success: boolean }>;
    delete: (service: string) => Promise<{ success: boolean }>;
  };
  entities: {
    list: (entityType: string) => Promise<EntityData[]>;
    create: (
      entityType: string,
      data: { name: string; files: { name: string; buffer: ArrayBuffer }[] },
    ) => Promise<EntityData>;
    update: (
      entityType: string,
      id: string,
      data: {
        name: string;
        existingImages: string[];
        newFiles: { name: string; buffer: ArrayBuffer }[];
      },
    ) => Promise<EntityData>;
    delete: (entityType: string, id: string) => Promise<{ success: boolean }>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
