import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getDataDir } from './paths';

interface StoredKey {
  key: string;
  savedAt: string;
}

interface ApiKeyStore {
  keys: Record<string, StoredKey>;
}

function getStorePath(): string {
  return join(getDataDir(), 'api-keys.json');
}

function readStore(): ApiKeyStore {
  const path = getStorePath();
  if (!existsSync(path)) return { keys: {} };
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as ApiKeyStore;
  } catch {
    return { keys: {} };
  }
}

function writeStore(store: ApiKeyStore): void {
  writeFileSync(getStorePath(), JSON.stringify(store, null, 2), 'utf-8');
}

export function getApiKey(service: string): string | null {
  const store = readStore();
  return store.keys[service]?.key ?? null;
}

export function getAllApiKeys(): Record<string, { maskedKey: string; savedAt: string }> {
  const store = readStore();
  const result: Record<string, { maskedKey: string; savedAt: string }> = {};
  for (const [service, entry] of Object.entries(store.keys)) {
    result[service] = {
      maskedKey: maskKey(entry.key),
      savedAt: entry.savedAt,
    };
  }
  return result;
}

export function setApiKey(service: string, key: string): void {
  const store = readStore();
  store.keys[service] = { key, savedAt: new Date().toISOString() };
  writeStore(store);

  // Set in process.env so clients (e.g. fal-ai) pick it up
  const envMap: Record<string, string> = { fal: 'FAL_KEY' };
  if (envMap[service]) {
    process.env[envMap[service]] = key;
  }
}

export function deleteApiKey(service: string): void {
  const store = readStore();
  delete store.keys[service];
  writeStore(store);

  const envMap: Record<string, string> = { fal: 'FAL_KEY' };
  if (envMap[service]) {
    delete process.env[envMap[service]];
  }
}

/** Load saved keys into process.env on startup */
export function loadApiKeysIntoEnv(): void {
  const store = readStore();
  const envMap: Record<string, string> = { fal: 'FAL_KEY' };
  for (const [service, envVar] of Object.entries(envMap)) {
    if (store.keys[service] && !process.env[envVar]) {
      process.env[envVar] = store.keys[service].key;
    }
  }
}

function maskKey(key: string): string {
  if (key.length <= 12) return '****';
  return key.slice(0, 6) + '****' + key.slice(-4);
}
