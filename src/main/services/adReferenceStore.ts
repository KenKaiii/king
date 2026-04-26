import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { getAdReferencesDir, getAdReferencesJsonPath } from './paths';
import { readJson, writeJsonAtomic, withJsonLock } from './atomicJson';

export interface StoredAdReference {
  id: string;
  filename: string;
  /** URL the renderer uses to display the image (local-file:// scheme). */
  url: string;
  /** Simplified ratio string e.g. "1:1", "9:16", "3:4" — derived from
   *  the natural pixel dimensions on upload. Used for display + variant
   *  matching during generation. */
  aspectRatio: string;
  width: number;
  height: number;
  createdAt: string;
}

interface AdReferenceStoreFile {
  refs: StoredAdReference[];
}

function readStore(): AdReferenceStoreFile {
  return readJson<AdReferenceStoreFile>(getAdReferencesJsonPath(), { refs: [] });
}

export function listAdReferences(): StoredAdReference[] {
  const store = readStore();
  return [...store.refs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function addAdReference(
  file: { name: string; buffer: Buffer },
  dimensions: { width: number; height: number; aspectRatio: string },
): Promise<StoredAdReference> {
  const dir = getAdReferencesDir();
  const ext = extname(file.name).toLowerCase() || '.png';
  const filename = `${randomUUID()}${ext}`;
  const filePath = join(dir, filename);
  writeFileSync(filePath, file.buffer);

  const ref: StoredAdReference = {
    id: randomUUID(),
    filename,
    url: `local-file:///ad-references/${filename}`,
    aspectRatio: dimensions.aspectRatio,
    width: dimensions.width,
    height: dimensions.height,
    createdAt: new Date().toISOString(),
  };

  const path = getAdReferencesJsonPath();
  return withJsonLock(path, () => {
    const store = readStore();
    store.refs.push(ref);
    writeJsonAtomic(path, store);
    return ref;
  });
}

export async function deleteAdReference(id: string): Promise<boolean> {
  const path = getAdReferencesJsonPath();
  return withJsonLock(path, () => {
    const store = readStore();
    const ref = store.refs.find((r) => r.id === id);
    if (!ref) return false;

    const filePath = join(getAdReferencesDir(), ref.filename);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {
        // Image file already gone or unwritable — still drop the record so
        // the carousel doesn't keep showing a broken entry.
      }
    }

    store.refs = store.refs.filter((r) => r.id !== id);
    writeJsonAtomic(path, store);
    return true;
  });
}
