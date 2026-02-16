import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
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

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
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
const mockedReadFileSync = vi.mocked(readFileSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);
const mockedUnlinkSync = vi.mocked(unlinkSync);
const mockedRandomUUID = vi.mocked(randomUUID);

describe('entityStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- listEntities ----------

  describe('listEntities', () => {
    it('returns sorted entities (newest first)', () => {
      const entities = [
        {
          id: 'e1',
          name: 'Entity 1',
          referenceImages: [],
          thumbnailUrl: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'e2',
          name: 'Entity 2',
          referenceImages: [],
          thumbnailUrl: null,
          createdAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'e3',
          name: 'Entity 3',
          referenceImages: [],
          thumbnailUrl: null,
          createdAt: '2024-03-01T00:00:00.000Z',
        },
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities }));

      const result = listEntities('products');

      expect(result.map((e) => e.id)).toEqual(['e2', 'e3', 'e1']);
    });

    it('returns empty array when file does not exist', () => {
      mockedExistsSync.mockReturnValue(false);

      const result = listEntities('products');

      expect(result).toEqual([]);
    });
  });

  // ---------- getEntity ----------

  describe('getEntity', () => {
    it('finds entity by id', () => {
      const entities = [
        {
          id: 'e1',
          name: 'Entity 1',
          referenceImages: [],
          thumbnailUrl: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities }));

      const result = getEntity('products', 'e1');

      expect(result).toBeDefined();
      expect(result!.name).toBe('Entity 1');
    });

    it('returns undefined for missing entity', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities: [] }));

      const result = getEntity('products', 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  // ---------- addEntity ----------

  describe('addEntity', () => {
    it('creates entity with thumbnailUrl set to first image', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities: [] }));
      mockedRandomUUID.mockReturnValue('uuid-1234' as `${string}-${string}-${string}-${string}-${string}`);

      const images = ['local-file:///entities/products/img1.png', 'local-file:///entities/products/img2.png'];
      const result = addEntity('products', 'My Product', images);

      expect(result.id).toBe('uuid-1234');
      expect(result.name).toBe('My Product');
      expect(result.referenceImages).toEqual(images);
      expect(result.thumbnailUrl).toBe('local-file:///entities/products/img1.png');
      expect(result.createdAt).toBeDefined();
    });

    it('sets thumbnailUrl to null when no images provided', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities: [] }));
      mockedRandomUUID.mockReturnValue('uuid-5678' as `${string}-${string}-${string}-${string}-${string}`);

      const result = addEntity('products', 'Empty Product', []);

      expect(result.thumbnailUrl).toBeNull();
    });

    it('writes entity to store file', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities: [] }));
      mockedRandomUUID.mockReturnValue('uuid-9999' as `${string}-${string}-${string}-${string}-${string}`);

      addEntity('products', 'Test', []);

      expect(mockedWriteFileSync).toHaveBeenCalledOnce();
      const writtenData = JSON.parse(mockedWriteFileSync.mock.calls[0][1] as string);
      expect(writtenData.entities).toHaveLength(1);
      expect(writtenData.entities[0].id).toBe('uuid-9999');
    });
  });

  // ---------- updateEntity ----------

  describe('updateEntity', () => {
    it('updates name and images', () => {
      const entities = [
        {
          id: 'e1',
          name: 'Old Name',
          referenceImages: ['old-img.png'],
          thumbnailUrl: 'old-img.png',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities }));

      const newImages = ['new-img1.png', 'new-img2.png'];
      const result = updateEntity('products', 'e1', 'New Name', newImages);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('New Name');
      expect(result!.referenceImages).toEqual(newImages);
      expect(result!.thumbnailUrl).toBe('new-img1.png');
      // createdAt should be preserved
      expect(result!.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('returns null for nonexistent entity', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities: [] }));

      const result = updateEntity('products', 'nonexistent', 'Name', []);

      expect(result).toBeNull();
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });

    it('sets thumbnailUrl to null when images list is empty', () => {
      const entities = [
        {
          id: 'e1',
          name: 'Entity',
          referenceImages: ['img.png'],
          thumbnailUrl: 'img.png',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities }));

      const result = updateEntity('products', 'e1', 'Entity', []);

      expect(result!.thumbnailUrl).toBeNull();
    });
  });

  // ---------- deleteEntity ----------

  describe('deleteEntity', () => {
    it('removes entity and deletes image files', () => {
      const entities = [
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
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities }));

      const result = deleteEntity('products', 'e1');

      expect(result).toBe(true);
      // Should delete 2 image files
      expect(mockedUnlinkSync).toHaveBeenCalledTimes(2);
      expect(mockedUnlinkSync).toHaveBeenCalledWith('/mock/data/images/entities/products/file1.png');
      expect(mockedUnlinkSync).toHaveBeenCalledWith('/mock/data/images/entities/products/file2.png');

      // Store should be written without the entity
      const writtenData = JSON.parse(mockedWriteFileSync.mock.calls[0][1] as string);
      expect(writtenData.entities).toHaveLength(0);
    });

    it('returns false for nonexistent entity', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities: [] }));

      const result = deleteEntity('products', 'nonexistent');

      expect(result).toBe(false);
    });

    it('skips file deletion if image file does not exist on disk', () => {
      const entities = [
        {
          id: 'e1',
          name: 'Entity',
          referenceImages: ['local-file:///entities/products/missing.png'],
          thumbnailUrl: 'local-file:///entities/products/missing.png',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      // First call: existsSync for the store file (true)
      // Second call: existsSync for image file (false)
      mockedExistsSync.mockImplementation((path: unknown) => {
        if (typeof path === 'string' && path.endsWith('.json')) return true;
        return false; // image file does not exist
      });
      mockedReadFileSync.mockReturnValue(JSON.stringify({ entities }));

      deleteEntity('products', 'e1');

      expect(mockedUnlinkSync).not.toHaveBeenCalled();
    });
  });

  // ---------- saveEntityImages ----------

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

  // ---------- Empty store handling ----------

  describe('empty store handling', () => {
    it('returns empty entities when file is missing', () => {
      mockedExistsSync.mockReturnValue(false);

      const result = listEntities('products');

      expect(result).toEqual([]);
    });

    it('returns empty entities when JSON is corrupted', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('{{invalid json');

      const result = listEntities('products');

      expect(result).toEqual([]);
    });
  });
});
