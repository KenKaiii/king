import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock('../../../src/main/services/paths', () => ({
  getImagesJsonPath: vi.fn(() => '/mock/data/images.json'),
}));

import { readFileSync, writeFileSync, existsSync } from 'fs';
import {
  listImages,
  addImage,
  deleteImage,
  getImage,
  type StoredImage,
} from '../../../src/main/services/imageStore';

const mockedExistsSync = vi.mocked(existsSync);
const mockedReadFileSync = vi.mocked(readFileSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);

function makeImage(id: string, createdAt: string): StoredImage {
  return {
    id,
    url: `local-file:///${id}.png`,
    thumbnailUrl: null,
    prompt: `prompt for ${id}`,
    aspectRatio: '1:1',
    createdAt,
    filename: `${id}.png`,
  };
}

describe('imageStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- listImages ----------

  describe('listImages', () => {
    it('returns paginated results sorted by createdAt descending', () => {
      const images = [
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-06-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      const result = listImages(undefined, 10);

      expect(result.data.map((i) => i.id)).toEqual(['img-2', 'img-3', 'img-1']);
    });

    it('respects limit parameter', () => {
      const images = [
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
        makeImage('img-4', '2024-04-01T00:00:00.000Z'),
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      const result = listImages(undefined, 2);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('img-4');
      expect(result.data[1].id).toBe('img-3');
    });

    it('returns items after cursor position', () => {
      const images = [
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
        makeImage('img-4', '2024-04-01T00:00:00.000Z'),
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      // Sorted descending: img-4, img-3, img-2, img-1
      // Cursor = img-3 means start after img-3
      const result = listImages('img-3', 10);

      expect(result.data.map((i) => i.id)).toEqual(['img-2', 'img-1']);
    });

    it('hasMore is true when more items exist beyond limit', () => {
      const images = [
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      const result = listImages(undefined, 2);

      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('img-2');
    });

    it('hasMore is false when no more items remain', () => {
      const images = [
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      const result = listImages(undefined, 10);

      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('uses default limit of 18', () => {
      const images = Array.from({ length: 20 }, (_, i) =>
        makeImage(`img-${i}`, new Date(2024, 0, i + 1).toISOString()),
      );
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      const result = listImages();

      expect(result.data).toHaveLength(18);
      expect(result.hasMore).toBe(true);
    });
  });

  // ---------- addImage ----------

  describe('addImage', () => {
    it('appends image to store and writes file', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images: [] }));

      const newImage = makeImage('new-img', '2024-06-15T00:00:00.000Z');
      const result = addImage(newImage);

      expect(result).toEqual(newImage);
      expect(mockedWriteFileSync).toHaveBeenCalledOnce();
      const writtenData = JSON.parse(mockedWriteFileSync.mock.calls[0][1] as string);
      expect(writtenData.images).toHaveLength(1);
      expect(writtenData.images[0].id).toBe('new-img');
    });

    it('appends to existing images', () => {
      const existing = makeImage('existing', '2024-01-01T00:00:00.000Z');
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images: [existing] }));

      const newImage = makeImage('new-img', '2024-06-15T00:00:00.000Z');
      addImage(newImage);

      const writtenData = JSON.parse(mockedWriteFileSync.mock.calls[0][1] as string);
      expect(writtenData.images).toHaveLength(2);
    });
  });

  // ---------- deleteImage ----------

  describe('deleteImage', () => {
    it('removes image from store and writes file', () => {
      const images = [
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      const result = deleteImage('img-1');

      expect(result).toBe(true);
      const writtenData = JSON.parse(mockedWriteFileSync.mock.calls[0][1] as string);
      expect(writtenData.images).toHaveLength(1);
      expect(writtenData.images[0].id).toBe('img-2');
    });

    it('returns false when image not found', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images: [] }));

      const result = deleteImage('nonexistent');

      expect(result).toBe(false);
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });
  });

  // ---------- getImage ----------

  describe('getImage', () => {
    it('finds image by id', () => {
      const images = [
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
      ];
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images }));

      const result = getImage('img-2');

      expect(result).toBeDefined();
      expect(result!.id).toBe('img-2');
    });

    it('returns undefined for missing image', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ images: [] }));

      const result = getImage('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  // ---------- Empty / corrupted store ----------

  describe('empty store', () => {
    it('handles missing file gracefully', () => {
      mockedExistsSync.mockReturnValue(false);

      const result = listImages();

      expect(result.data).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('corrupted JSON', () => {
    it('returns empty store on corrupted JSON', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('{{not valid json}}');

      const result = listImages();

      expect(result.data).toEqual([]);
      expect(result.hasMore).toBe(false);
    });
  });
});
