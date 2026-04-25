import { describe, it, expect, vi, beforeEach } from 'vitest';

// `vi.hoisted` keeps these mock handles reachable from the hoisted
// `vi.mock` factory below. Without it, vi.mock fails with
// "cannot access X before initialization".
const mocks = vi.hoisted(() => {
  const store: { images: unknown[] } = { images: [] };
  return {
    store,
    readJson: vi.fn(() => ({ images: [...(store.images as never[])] })),
    writeJsonAtomic: vi.fn((_path: string, value: { images: unknown[] }) => {
      store.images = value.images;
    }),
    withJsonLock: vi.fn((_path: string, fn: () => unknown) => Promise.resolve(fn())),
  };
});
const { store, readJson, writeJsonAtomic, withJsonLock } = mocks;

vi.mock('../../../src/main/services/atomicJson', () => ({
  readJson: mocks.readJson,
  writeJsonAtomic: mocks.writeJsonAtomic,
  withJsonLock: mocks.withJsonLock,
}));

vi.mock('../../../src/main/services/paths', () => ({
  getImagesJsonPath: vi.fn(() => '/mock/data/images.json'),
}));

import {
  listImages,
  addImage,
  deleteImage,
  getImage,
  type StoredImage,
} from '../../../src/main/services/imageStore';

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

function setImages(images: StoredImage[]): void {
  store.images = images;
}

describe('imageStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.images = [];
  });

  describe('listImages', () => {
    it('returns paginated results sorted by createdAt descending', () => {
      setImages([
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-06-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
      ]);
      const result = listImages(undefined, 10);
      expect(result.data.map((i) => i.id)).toEqual(['img-2', 'img-3', 'img-1']);
    });

    it('respects limit parameter', () => {
      setImages([
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
        makeImage('img-4', '2024-04-01T00:00:00.000Z'),
      ]);
      const result = listImages(undefined, 2);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('img-4');
      expect(result.data[1].id).toBe('img-3');
    });

    it('returns items after cursor position', () => {
      setImages([
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
        makeImage('img-4', '2024-04-01T00:00:00.000Z'),
      ]);
      const result = listImages('img-3', 10);
      expect(result.data.map((i) => i.id)).toEqual(['img-2', 'img-1']);
    });

    it('hasMore is true when more items exist beyond limit', () => {
      setImages([
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
        makeImage('img-3', '2024-03-01T00:00:00.000Z'),
      ]);
      const result = listImages(undefined, 2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('img-2');
    });

    it('hasMore is false when no more items remain', () => {
      setImages([
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
      ]);
      const result = listImages(undefined, 10);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('uses default limit of 18', () => {
      setImages(
        Array.from({ length: 20 }, (_, i) =>
          makeImage(`img-${i}`, new Date(2024, 0, i + 1).toISOString()),
        ),
      );
      const result = listImages();
      expect(result.data).toHaveLength(18);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('addImage', () => {
    it('appends image to store and writes file', async () => {
      const newImage = makeImage('new-img', '2024-06-15T00:00:00.000Z');
      const result = await addImage(newImage);

      expect(result).toEqual(newImage);
      expect(writeJsonAtomic).toHaveBeenCalledOnce();
      const written = writeJsonAtomic.mock.calls[0][1] as { images: StoredImage[] };
      expect(written.images).toHaveLength(1);
      expect(written.images[0].id).toBe('new-img');
    });

    it('appends to existing images', async () => {
      setImages([makeImage('existing', '2024-01-01T00:00:00.000Z')]);
      await addImage(makeImage('new-img', '2024-06-15T00:00:00.000Z'));

      const written = writeJsonAtomic.mock.calls[0][1] as { images: StoredImage[] };
      expect(written.images).toHaveLength(2);
    });
  });

  describe('deleteImage', () => {
    it('removes image from store and writes file', async () => {
      setImages([
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
      ]);
      const result = await deleteImage('img-1');

      expect(result).toBe(true);
      const written = writeJsonAtomic.mock.calls[0][1] as { images: StoredImage[] };
      expect(written.images).toHaveLength(1);
      expect(written.images[0].id).toBe('img-2');
    });

    it('returns false when image not found', async () => {
      setImages([]);
      const result = await deleteImage('nonexistent');
      expect(result).toBe(false);
      expect(writeJsonAtomic).not.toHaveBeenCalled();
    });
  });

  describe('getImage', () => {
    it('finds image by id', async () => {
      setImages([
        makeImage('img-1', '2024-01-01T00:00:00.000Z'),
        makeImage('img-2', '2024-02-01T00:00:00.000Z'),
      ]);
      const result = await getImage('img-2');
      expect(result).toBeDefined();
      expect(result!.id).toBe('img-2');
    });

    it('returns undefined for missing image', async () => {
      setImages([]);
      const result = await getImage('nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
