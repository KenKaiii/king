import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { getEntityJsonPath, getEntityImagesDir } from './paths';
import { readJson, writeJsonAtomic, withJsonLock } from './atomicJson';

export interface StoredEntity {
  id: string;
  name: string;
  referenceImages: string[];
  thumbnailUrl: string | null;
  createdAt: string;
  productType?: string;
}

interface EntityStore {
  entities: StoredEntity[];
}

function readStore(entityType: string): EntityStore {
  return readJson<EntityStore>(getEntityJsonPath(entityType), { entities: [] });
}

export function listEntities(entityType: string): StoredEntity[] {
  const store = readStore(entityType);
  return [...store.entities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getEntity(entityType: string, id: string): StoredEntity | undefined {
  const store = readStore(entityType);
  return store.entities.find((e) => e.id === id);
}

export function saveEntityImages(
  entityType: string,
  files: { name: string; buffer: Buffer }[],
): string[] {
  const dir = getEntityImagesDir(entityType);
  const urls: string[] = [];

  for (const file of files) {
    const ext = extname(file.name) || '.png';
    const filename = `${randomUUID()}${ext}`;
    const filePath = join(dir, filename);
    writeFileSync(filePath, file.buffer);
    urls.push(`local-file:///entities/${entityType}/${filename}`);
  }

  return urls;
}

export async function addEntity(
  entityType: string,
  name: string,
  referenceImages: string[],
  productType?: string,
): Promise<StoredEntity> {
  const path = getEntityJsonPath(entityType);
  return withJsonLock(path, () => {
    const store = readStore(entityType);
    const entity: StoredEntity = {
      id: randomUUID(),
      name,
      referenceImages,
      thumbnailUrl: referenceImages[0] ?? null,
      createdAt: new Date().toISOString(),
      ...(productType ? { productType } : {}),
    };
    store.entities.push(entity);
    writeJsonAtomic(path, store);
    return entity;
  });
}

export async function updateEntity(
  entityType: string,
  id: string,
  name: string,
  referenceImages: string[],
  productType?: string,
): Promise<StoredEntity | null> {
  const path = getEntityJsonPath(entityType);
  return withJsonLock(path, () => {
    const store = readStore(entityType);
    const index = store.entities.findIndex((e) => e.id === id);
    const existing = index === -1 ? undefined : store.entities[index];
    if (!existing) return null;

    const updated: StoredEntity = {
      ...existing,
      name,
      referenceImages,
      thumbnailUrl: referenceImages[0] ?? null,
      ...(productType !== undefined ? { productType } : {}),
    };
    store.entities[index] = updated;
    writeJsonAtomic(path, store);
    return updated;
  });
}

export async function deleteEntity(entityType: string, id: string): Promise<boolean> {
  const path = getEntityJsonPath(entityType);
  return withJsonLock(path, () => {
    const store = readStore(entityType);
    const entity = store.entities.find((e) => e.id === id);
    if (!entity) return false;

    // Delete reference image files
    const dir = getEntityImagesDir(entityType);
    for (const imageUrl of entity.referenceImages) {
      // Extract filename from local-file:///entities/<type>/<filename>
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      if (!filename) continue;
      const filePath = join(dir, filename);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }

    store.entities = store.entities.filter((e) => e.id !== id);
    writeJsonAtomic(path, store);
    return true;
  });
}
