import { app } from 'electron';
import { join } from 'path';
import { mkdirSync } from 'fs';

let dataDir: string;
let imagesDir: string;

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function getDataDir(): string {
  if (!dataDir) {
    dataDir = join(app.getPath('userData'), 'data');
    ensureDir(dataDir);
  }
  return dataDir;
}

export function getImagesDir(): string {
  if (!imagesDir) {
    imagesDir = join(getDataDir(), 'images');
    ensureDir(imagesDir);
  }
  return imagesDir;
}

export function getImagesJsonPath(): string {
  return join(getDataDir(), 'images.json');
}

export function getEntityImagesDir(entityType: string): string {
  const dir = join(getImagesDir(), 'entities', entityType);
  ensureDir(dir);
  return dir;
}

export function getEntityJsonPath(entityType: string): string {
  return join(getDataDir(), `${entityType}.json`);
}
