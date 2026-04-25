import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the atomic layer \u2014 tests focus on entity-store behaviour, not the
// atomic-write + fsync mechanics (those are covered indirectly via
// integration and are intentionally implementation details).
const mocks = vi.hoisted(() => {
  const fakeStore: { entities: unknown[] } = { entities: [] };
  return {
    fakeStore,
    readJson: vi.fn(() => ({ entities: [...(fakeStore.entities as never[])] })),
    writeJsonAtomic: vi.fn((_path: string, value: { entities: unknown[] }) => {
      fakeStore.entities = value.entities;
    }),
    withJsonLock: vi.fn((_path: string, fn: () => unknown) => Promise.resolve(fn())),
  };
});
const { fakeStore, writeJsonAtomic } = mocks;

vi.mock('../../../src/main/services/atomicJson', () => ({
  readJson: mocks.readJson,
  writeJsonAtomic: mocks.writeJsonAtomic,
  withJsonLock: mocks.withJsonLock,
}));

vi.mock('fs', () => ({
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

vi.mock('../../../src/main/services/paths', () => ({
  getEntityJsonPath: vi.fn((entityType: string) => `/mock/data/${entityType}.json`),
  getEntityImagesDir: vi.fn((entityType: string) => `/mock/data/images/entities/${entityType}`),
}));

import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';
import {
  listEntities,
  getEntity,
  addEntity,
  updateEntity,
  deleteEntity,
  saveEntityImages,
} from '../../../src/main/services/entityStore';

const mockedExistsSync = vi.mocked(existsSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);
const mockedUnlinkSync = vi.mocked(unlinkSync);
const mockedRandomUUID = vi.mocked(randomUUID);

function setEntities(entities: unknown[]): void {
  fakeStore.entities = entities;
}

describe('entityStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeStore.entities = [];
  });

  describe('listEntities', () => {
    it('returns sorted entities (newest first)', () => {
      setEntities([
        { id: 'e1', name: 'Entity 1', referenceImages: [], thumbnailUrl: null, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 'e2', name: 'Entity 2', referenceImages: [], thumbnailUrl: null, createdAt: '2024-06-01T00:00:00.000Z' },
        { id: 'e3', name: 'Entity 3', referenceImages: [], thumbnailUrl: null, createdAt: '2024-03-01T00:00:00.000Z' },
      ]);
      const result = listEntities('products');
      expect(result.map((e) => e.id)).toEqual(['e2', 'e3', 'e1']);
    });

    it('returns empty array when store is empty', () => {
      setEntities([]);
      expect(listEntities('products')).toEqual([]);
    });
  });

  describe('getEntity', () => {
    it('finds entity by id', () => {
      setEntities([
        { id: 'e1', name: 'Entity 1', referenceImages: [], thumbnailUrl: null, createdAt: '2024-01-01T00:00:00.000Z' },
      ]);
      const result = getEntity('products', 'e1');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Entity 1');
    });

    it('returns undefined for missing entity', () => {
      setEntities([]);
      expect(getEntity('products', 'nonexistent')).toBeUndefined();
    });
  });

  describe('addEntity', () => {
    it('creates entity with thumbnailUrl set to first image', async () => {
      mockedRandomUUID.mockReturnValue('uuid-1234' as `${string}-${string}-${string}-${string}-${string}`);
      const images = ['local-file:///entities/products/img1.png', 'local-file:///entities/products/img2.png'];
      const result = await addEntity('products', 'My Product', images);

      expect(result.id).toBe('uuid-1234');
      expect(result.name).toBe('My Product');
      expect(result.referenceImages).toEqual(images);
      expect(result.thumbnailUrl).toBe('local-file:///entities/products/img1.png');
      expect(result.createdAt).toBeDefined();
    });

    it('sets thumbnailUrl to null when no images provided', async () => {
      mockedRandomUUID.mockReturnValue('uuid-5678' as `${string}-${string}-${string}-${string}-${string}`);
      const result = await addEntity('products', 'Empty Product', []);
      expect(result.thumbnailUrl).toBeNull();
    });

    it('writes entity to store', async () => {
      mockedRandomUUID.mockReturnValue('uuid-9999' as `${string}-${string}-${string}-${string}-${string}`);
      await addEntity('products', 'Test', []);

      expect(writeJsonAtomic).toHaveBeenCalledOnce();
      const written = writeJsonAtomic.mock.calls[0][1] as { entities: Array<{ id: string }> };
      expect(written.entities).toHaveLength(1);
      expect(written.entities[0].id).toBe('uuid-9999');
    });
  });

  describe('updateEntity', () => {
    it('updates name and images', async () => {
      setEntities([
        { id: 'e1', name: 'Old Name', referenceImages: ['old-img.png'], thumbnailUrl: 'old-img.png', createdAt: '2024-01-01T00:00:00.000Z' },
      ]);
      const newImages = ['new-img1.png', 'new-img2.png'];
      const result = await updateEntity('products', 'e1', 'New Name', newImages);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('New Name');
      expect(result!.referenceImages).toEqual(newImages);
      expect(result!.thumbnailUrl).toBe('new-img1.png');
      expect(result!.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('returns null for nonexistent entity', async () => {
      setEntities([]);
      const result = await updateEntity('products', 'nonexistent', 'Name', []);
      expect(result).toBeNull();
      expect(writeJsonAtomic).not.toHaveBeenCalled();
    });

    it('sets thumbnailUrl to null when images list is empty', async () => {
      setEntities([
        { id: 'e1', name: 'Entity', referenceImages: ['img.png'], thumbnailUrl: 'img.png', createdAt: '2024-01-01T00:00:00.000Z' },
      ]);
      const result = await updateEntity('products', 'e1', 'Entity', []);
      expect(result!.thumbnailUrl).toBeNull();
    });
  });

  describe('deleteEntity', () => {
    it('removes entity and deletes image files', async () => {
      setEntities([
        {
          id: 'e1',
          name: 'Entity',
          referenceImages: [
            'local-file:///entities/products/file1.png',
            'local-file:///entities/products/file2.png',
          ],
          thumbnailUrl: 'local-file:///entities/products/file1.png',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ]);
      mockedExistsSync.mockReturnValue(true);

      const result = await deleteEntity('products', 'e1');

      expect(result).toBe(true);
      expect(mockedUnlinkSync).toHaveBeenCalledTimes(2);
      expect(mockedUnlinkSync).toHaveBeenCalledWith('/mock/data/images/entities/products/file1.png');
      expect(mockedUnlinkSync).toHaveBeenCalledWith('/mock/data/images/entities/products/file2.png');

      const written = writeJsonAtomic.mock.calls[0][1] as { entities: unknown[] };
      expect(written.entities).toHaveLength(0);
    });

    it('returns false for nonexistent entity', async () => {
      setEntities([]);
      const result = await deleteEntity('products', 'nonexistent');
      expect(result).toBe(false);
    });

    it('skips file deletion if image file does not exist on disk', async () => {
      setEntities([
        {
          id: 'e1',
          name: 'Entity',
          referenceImages: ['local-file:///entities/products/missing.png'],
          thumbnailUrl: 'local-file:///entities/products/missing.png',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ]);
      mockedExistsSync.mockReturnValue(false);

      await deleteEntity('products', 'e1');

      expect(mockedUnlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('saveEntityImages', () => {
    it('writes files and returns local-file:// URLs', () => {
      let callCount = 0;
      mockedRandomUUID.mockImplementation(() => {
        callCount++;
        return `uuid-${callCount}` as `${string}-${string}-${string}-${string}-${string}`;
      });

      const files = [
        { name: 'photo.jpg', buffer: Buffer.from('jpg-data') },
        { name: 'image.png', buffer: Buffer.from('png-data') },
      ];

      const urls = saveEntityImages('products', files);

      expect(urls).toHaveLength(2);
      expect(urls[0]).toBe('local-file:///entities/products/uuid-1.jpg');
      expect(urls[1]).toBe('local-file:///entities/products/uuid-2.png');

      expect(mockedWriteFileSync).toHaveBeenCalledTimes(2);
      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        '/mock/data/images/entities/products/uuid-1.jpg',
        Buffer.from('jpg-data'),
      );
      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        '/mock/data/images/entities/products/uuid-2.png',
        Buffer.from('png-data'),
      );
    });

    it('defaults to .png when file has no extension', () => {
      mockedRandomUUID.mockReturnValue('uuid-noext' as `${string}-${string}-${string}-${string}-${string}`);
      const files = [{ name: 'noext', buffer: Buffer.from('data') }];
      const urls = saveEntityImages('products', files);
      expect(urls[0]).toBe('local-file:///entities/products/uuid-noext.png');
    });
  });
});
