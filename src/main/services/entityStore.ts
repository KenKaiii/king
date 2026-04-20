import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { getEntityJsonPath, getEntityImagesDir } from './paths';

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
  const path = getEntityJsonPath(entityType);
  if (!existsSync(path)) {
    return { entities: [] };
  }
  try {
    const data = readFileSync(path, 'utf-8');
    return JSON.parse(data) as EntityStore;
  } catch {
    return { entities: [] };
  }
}

function writeStore(entityType: string, store: EntityStore): void {
  const path = getEntityJsonPath(entityType);
  writeFileSync(path, JSON.stringify(store, null, 2), 'utf-8');
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

export function addEntity(
  entityType: string,
  name: string,
  referenceImages: string[],
  productType?: string,
): StoredEntity {
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
  writeStore(entityType, store);
  return entity;
}

export function updateEntity(
  entityType: string,
  id: string,
  name: string,
  referenceImages: string[],
  productType?: string,
): StoredEntity | null {
  const store = readStore(entityType);
  const index = store.entities.findIndex((e) => e.id === id);
  if (index === -1) return null;

  store.entities[index] = {
    ...store.entities[index],
    name,
    referenceImages,
    thumbnailUrl: referenceImages[0] ?? null,
    ...(productType !== undefined ? { productType } : {}),
  };
  writeStore(entityType, store);
  return store.entities[index];
}

export function deleteEntity(entityType: string, id: string): boolean {
  const store = readStore(entityType);
  const entity = store.entities.find((e) => e.id === id);
  if (!entity) return false;

  // Delete reference image files
  const dir = getEntityImagesDir(entityType);
  for (const imageUrl of entity.referenceImages) {
    // Extract filename from local-file:///entities/<type>/<filename>
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const filePath = join(dir, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  store.entities = store.entities.filter((e) => e.id !== id);
  writeStore(entityType, store);
  return true;
}
