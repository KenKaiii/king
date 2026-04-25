import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock safeStorage so tests don't require a running Electron app. Identity
// encryption (base64 round-trip) is enough to exercise the store logic.
vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => true,
    encryptString: (s: string) => Buffer.from(s, 'utf8'),
    decryptString: (buf: Buffer) => buf.toString('utf8'),
  },
}));

vi.mock('electron-log/main', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const mocks = vi.hoisted(() => {
  const fakeStore: {
    keys: Record<string, { encryptedKey?: string; key?: string; savedAt: string }>;
  } = { keys: {} };
  return {
    fakeStore,
    readJson: vi.fn(() => ({ keys: { ...fakeStore.keys } })),
    writeJsonAtomic: vi.fn(
      (_path: string, value: { keys: Record<string, { encryptedKey?: string; savedAt: string }> }) => {
        fakeStore.keys = value.keys;
      },
    ),
    withJsonLock: vi.fn((_path: string, fn: () => unknown) => Promise.resolve(fn())),
  };
});
const { fakeStore, writeJsonAtomic } = mocks;

vi.mock('../../../src/main/services/atomicJson', () => ({
  readJson: mocks.readJson,
  writeJsonAtomic: mocks.writeJsonAtomic,
  withJsonLock: mocks.withJsonLock,
}));

vi.mock('../../../src/main/services/paths', () => ({
  getDataDir: vi.fn(() => '/mock/data'),
}));

import {
  getAllApiKeys,
  getApiKey,
  setApiKey,
  deleteApiKey,
  loadApiKeysIntoEnv,
} from '../../../src/main/services/apiKeyStore';

function encodeForTest(plain: string): string {
  return Buffer.from(plain, 'utf8').toString('base64');
}

function seedKey(service: string, plain: string, savedAt = '2024-01-01T00:00:00.000Z'): void {
  fakeStore.keys[service] = { encryptedKey: encodeForTest(plain), savedAt };
}

describe('apiKeyStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeStore.keys = {};
    delete process.env.FAL_KEY;
  });

  describe('maskKey (via getAllApiKeys)', () => {
    it('masks keys <= 12 chars as ****', () => {
      seedKey('fal', 'short');
      expect(getAllApiKeys().fal.maskedKey).toBe('****');
    });

    it('masks keys exactly 12 chars as ****', () => {
      seedKey('fal', '123456789012');
      expect(getAllApiKeys().fal.maskedKey).toBe('****');
    });

    it('masks keys > 12 chars showing first 6 + **** + last 4', () => {
      seedKey('fal', 'abcdef_middle_wxyz');
      expect(getAllApiKeys().fal.maskedKey).toBe('abcdef****wxyz');
    });
  });

  describe('getAllApiKeys', () => {
    it('returns masked keys with savedAt for all services', () => {
      seedKey('fal', 'fal_key_1234567890', '2024-06-01T00:00:00.000Z');
      seedKey('openai', 'sk-proj-abcdef1234', '2024-07-01T00:00:00.000Z');

      expect(getAllApiKeys()).toEqual({
        fal: { maskedKey: 'fal_ke****7890', savedAt: '2024-06-01T00:00:00.000Z' },
        openai: { maskedKey: 'sk-pro****1234', savedAt: '2024-07-01T00:00:00.000Z' },
      });
    });

    it('returns empty object when store is empty', () => {
      expect(getAllApiKeys()).toEqual({});
    });
  });

  describe('getApiKey', () => {
    it('returns the decrypted key for an existing service', () => {
      seedKey('fal', 'my-fal-key');
      expect(getApiKey('fal')).toBe('my-fal-key');
    });

    it('returns null for a missing service', () => {
      expect(getApiKey('fal')).toBeNull();
    });
  });

  describe('setApiKey', () => {
    it('writes the encrypted key to the store', async () => {
      await setApiKey('fal', 'new-fal-key');

      expect(writeJsonAtomic).toHaveBeenCalled();
      const written = writeJsonAtomic.mock.calls[0][1] as {
        keys: Record<string, { encryptedKey: string; savedAt: string }>;
      };
      expect(written.keys.fal.encryptedKey).toBe(encodeForTest('new-fal-key'));
      expect(written.keys.fal.savedAt).toBeDefined();
    });

    it('sets process.env.FAL_KEY for fal service', async () => {
      await setApiKey('fal', 'my-fal-key-value');
      expect(process.env.FAL_KEY).toBe('my-fal-key-value');
    });

    it('does not set env var for unknown services', async () => {
      await setApiKey('openai', 'sk-proj-abc');
      expect(process.env.FAL_KEY).toBeUndefined();
    });
  });

  describe('deleteApiKey', () => {
    it('removes the key from the store and writes', async () => {
      seedKey('fal', 'old-key');

      await deleteApiKey('fal');

      const calls = writeJsonAtomic.mock.calls;
      const lastWritten = calls[calls.length - 1][1] as { keys: Record<string, unknown> };
      expect(lastWritten.keys.fal).toBeUndefined();
    });

    it('deletes process.env.FAL_KEY for fal service', async () => {
      process.env.FAL_KEY = 'should-be-removed';
      seedKey('fal', 'old-key');

      await deleteApiKey('fal');

      expect(process.env.FAL_KEY).toBeUndefined();
    });

    it('does not delete env var for unknown services', async () => {
      process.env.FAL_KEY = 'should-remain';
      seedKey('openai', 'sk-proj-abc');

      await deleteApiKey('openai');

      expect(process.env.FAL_KEY).toBe('should-remain');
    });
  });

  describe('loadApiKeysIntoEnv', () => {
    it('loads fal key into process.env.FAL_KEY when not already set', () => {
      seedKey('fal', 'stored-fal-key');
      loadApiKeysIntoEnv();
      expect(process.env.FAL_KEY).toBe('stored-fal-key');
    });

    it('does NOT overwrite process.env.FAL_KEY if already set', () => {
      process.env.FAL_KEY = 'existing-value';
      seedKey('fal', 'stored-fal-key');
      loadApiKeysIntoEnv();
      expect(process.env.FAL_KEY).toBe('existing-value');
    });

    it('does nothing when no fal key is stored', () => {
      loadApiKeysIntoEnv();
      expect(process.env.FAL_KEY).toBeUndefined();
    });
  });

  describe('legacy plaintext migration', () => {
    it('migrates a legacy `key` field on first read', () => {
      fakeStore.keys.fal = { key: 'plain-legacy-key', savedAt: '2024-01-01T00:00:00.000Z' };

      expect(getApiKey('fal')).toBe('plain-legacy-key');
      // Migration should have written the encrypted form back to the store.
      expect(writeJsonAtomic).toHaveBeenCalled();
      expect(fakeStore.keys.fal.encryptedKey).toBe(encodeForTest('plain-legacy-key'));
      expect(fakeStore.keys.fal.key).toBeUndefined();
    });
  });
});
