import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock('../../../src/main/services/paths', () => ({
  getDataDir: vi.fn(() => '/mock/data'),
}));

import { readFileSync, writeFileSync, existsSync } from 'fs';
import {
  getAllApiKeys,
  getApiKey,
  setApiKey,
  deleteApiKey,
  loadApiKeysIntoEnv,
} from '../../../src/main/services/apiKeyStore';

const mockedExistsSync = vi.mocked(existsSync);
const mockedReadFileSync = vi.mocked(readFileSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);

describe('apiKeyStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.FAL_KEY;
  });

  // ---------- maskKey (tested indirectly through getAllApiKeys) ----------

  describe('maskKey (via getAllApiKeys)', () => {
    it('masks keys <= 12 chars as ****', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { fal: { key: 'short', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      const result = getAllApiKeys();
      expect(result.fal.maskedKey).toBe('****');
    });

    it('masks keys <= 12 chars (exactly 12) as ****', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { fal: { key: '123456789012', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      const result = getAllApiKeys();
      expect(result.fal.maskedKey).toBe('****');
    });

    it('masks keys > 12 chars showing first 6 + **** + last 4', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: {
            fal: { key: 'abcdef_middle_wxyz', savedAt: '2024-01-01T00:00:00.000Z' },
          },
        }),
      );

      const result = getAllApiKeys();
      // key = 'abcdef_middle_wxyz' (18 chars)
      // first 6 = 'abcdef', last 4 = 'wxyz'
      expect(result.fal.maskedKey).toBe('abcdef****wxyz');
    });
  });

  // ---------- getAllApiKeys ----------

  describe('getAllApiKeys', () => {
    it('returns masked keys with savedAt for all services', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: {
            fal: { key: 'fal_key_1234567890', savedAt: '2024-06-01T00:00:00.000Z' },
            openai: { key: 'sk-proj-abcdef1234', savedAt: '2024-07-01T00:00:00.000Z' },
          },
        }),
      );

      const result = getAllApiKeys();
      expect(result).toEqual({
        fal: { maskedKey: 'fal_ke****7890', savedAt: '2024-06-01T00:00:00.000Z' },
        openai: { maskedKey: 'sk-pro****1234', savedAt: '2024-07-01T00:00:00.000Z' },
      });
    });

    it('returns empty object when store file does not exist', () => {
      mockedExistsSync.mockReturnValue(false);
      const result = getAllApiKeys();
      expect(result).toEqual({});
    });
  });

  // ---------- getApiKey ----------

  describe('getApiKey', () => {
    it('returns the raw key for an existing service', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { fal: { key: 'my-fal-key', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      expect(getApiKey('fal')).toBe('my-fal-key');
    });

    it('returns null for a missing service', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ keys: {} }));

      expect(getApiKey('fal')).toBeNull();
    });
  });

  // ---------- setApiKey ----------

  describe('setApiKey', () => {
    it('writes the key to the JSON file', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ keys: {} }));

      setApiKey('fal', 'new-fal-key');

      expect(mockedWriteFileSync).toHaveBeenCalledOnce();
      const writtenData = JSON.parse(mockedWriteFileSync.mock.calls[0][1] as string);
      expect(writtenData.keys.fal.key).toBe('new-fal-key');
      expect(writtenData.keys.fal.savedAt).toBeDefined();
    });

    it('sets process.env.FAL_KEY for fal service', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ keys: {} }));

      setApiKey('fal', 'my-fal-key-value');

      expect(process.env.FAL_KEY).toBe('my-fal-key-value');
    });

    it('does not set env var for unknown services', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ keys: {} }));

      setApiKey('openai', 'sk-proj-abc');

      expect(process.env.FAL_KEY).toBeUndefined();
    });
  });

  // ---------- deleteApiKey ----------

  describe('deleteApiKey', () => {
    it('removes the key from the store and writes file', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { fal: { key: 'old-key', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      deleteApiKey('fal');

      const writtenData = JSON.parse(mockedWriteFileSync.mock.calls[0][1] as string);
      expect(writtenData.keys.fal).toBeUndefined();
    });

    it('deletes process.env.FAL_KEY for fal service', () => {
      process.env.FAL_KEY = 'should-be-removed';
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { fal: { key: 'old-key', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      deleteApiKey('fal');

      expect(process.env.FAL_KEY).toBeUndefined();
    });

    it('does not delete env var for unknown services', () => {
      process.env.FAL_KEY = 'should-remain';
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { openai: { key: 'sk-proj-abc', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      deleteApiKey('openai');

      expect(process.env.FAL_KEY).toBe('should-remain');
    });
  });

  // ---------- loadApiKeysIntoEnv ----------

  describe('loadApiKeysIntoEnv', () => {
    it('loads fal key into process.env.FAL_KEY when not already set', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { fal: { key: 'stored-fal-key', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      loadApiKeysIntoEnv();

      expect(process.env.FAL_KEY).toBe('stored-fal-key');
    });

    it('does NOT overwrite process.env.FAL_KEY if already set', () => {
      process.env.FAL_KEY = 'existing-value';
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          keys: { fal: { key: 'stored-fal-key', savedAt: '2024-01-01T00:00:00.000Z' } },
        }),
      );

      loadApiKeysIntoEnv();

      expect(process.env.FAL_KEY).toBe('existing-value');
    });

    it('does nothing when no fal key is stored', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ keys: {} }));

      loadApiKeysIntoEnv();

      expect(process.env.FAL_KEY).toBeUndefined();
    });
  });

  // ---------- Error recovery ----------

  describe('error recovery', () => {
    it('returns empty store when JSON is corrupted', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('NOT VALID JSON {{{');

      const result = getAllApiKeys();
      expect(result).toEqual({});
    });

    it('returns null for getApiKey when JSON is corrupted', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('corrupt data!!!');

      expect(getApiKey('fal')).toBeNull();
    });
  });
});
