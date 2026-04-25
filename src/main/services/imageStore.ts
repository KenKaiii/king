import { getImagesJsonPath } from './paths';
import { readJson, writeJsonAtomic, withJsonLock } from './atomicJson';

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
  return readJson<ImageStore>(getImagesJsonPath(), { images: [] });
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
    if (cursorIndex === -1) {
      // Cursor image was deleted between pages — without this guard we'd
      // silently restart from index 0 and the renderer would append
      // duplicates of page 1. Terminate the sequence instead; the client can
      // refresh if it needs more.
      return { data: [], nextCursor: null, hasMore: false };
    }
    startIndex = cursorIndex + 1;
  }

  const data = sorted.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < sorted.length;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return { data, nextCursor, hasMore };
}

export async function addImage(image: StoredImage): Promise<StoredImage> {
  const path = getImagesJsonPath();
  return withJsonLock(path, () => {
    const store = readStore();
    store.images.push(image);
    writeJsonAtomic(path, store);
    return image;
  });
}

export async function deleteImage(id: string): Promise<boolean> {
  const path = getImagesJsonPath();
  return withJsonLock(path, () => {
    const store = readStore();
    const index = store.images.findIndex((img) => img.id === id);
    if (index === -1) return false;
    store.images.splice(index, 1);
    writeJsonAtomic(path, store);
    return true;
  });
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  const store = readStore();
  return store.images.find((img) => img.id === id);
}
