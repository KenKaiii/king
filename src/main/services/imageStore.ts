import { readFileSync, writeFileSync, existsSync } from 'fs';
import { getImagesJsonPath } from './paths';

export interface StoredImage {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  filename: string;
}

interface ImageStore {
  images: StoredImage[];
}

function readStore(): ImageStore {
  const path = getImagesJsonPath();
  if (!existsSync(path)) {
    return { images: [] };
  }
  try {
    const data = readFileSync(path, 'utf-8');
    return JSON.parse(data) as ImageStore;
  } catch {
    return { images: [] };
  }
}

function writeStore(store: ImageStore): void {
  const path = getImagesJsonPath();
  writeFileSync(path, JSON.stringify(store, null, 2), 'utf-8');
}

export function listImages(
  cursor?: string,
  limit = 18,
): { data: StoredImage[]; nextCursor: string | null; hasMore: boolean } {
  const store = readStore();
  // Sort by createdAt descending (newest first)
  const sorted = [...store.images].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let startIndex = 0;
  if (cursor) {
    const cursorIndex = sorted.findIndex((img) => img.id === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }

  const data = sorted.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < sorted.length;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return { data, nextCursor, hasMore };
}

export function addImage(image: StoredImage): StoredImage {
  const store = readStore();
  store.images.push(image);
  writeStore(store);
  return image;
}

export function deleteImage(id: string): boolean {
  const store = readStore();
  const index = store.images.findIndex((img) => img.id === id);
  if (index === -1) return false;
  store.images.splice(index, 1);
  writeStore(store);
  return true;
}

export function getImage(id: string): StoredImage | undefined {
  const store = readStore();
  return store.images.find((img) => img.id === id);
}
