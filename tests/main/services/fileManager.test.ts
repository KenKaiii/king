import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

vi.mock('../../../src/main/services/paths', () => ({
  getImagesDir: vi.fn(() => '/mock/data/images'),
}));

import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import {
  downloadAndSaveImage,
  deleteImageFile,
} from '../../../src/main/services/fileManager';

const mockedWriteFileSync = vi.mocked(writeFileSync);
const mockedUnlinkSync = vi.mocked(unlinkSync);
const mockedExistsSync = vi.mocked(existsSync);
const mockedRandomUUID = vi.mocked(randomUUID);

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeFetchResponse(data: ArrayBuffer, ok = true, statusText = 'OK'): Response {
  return {
    ok,
    statusText,
    arrayBuffer: () => Promise.resolve(data),
  } as unknown as Response;
}

describe('fileManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- downloadAndSaveImage ----------

  describe('downloadAndSaveImage', () => {
    it('fetches URL, writes file, and returns correct URL', async () => {
      const imageData = new ArrayBuffer(8);
      mockFetch.mockResolvedValue(makeFetchResponse(imageData));
      mockedRandomUUID.mockReturnValue('test-uuid' as `${string}-${string}-${string}-${string}-${string}`);

      const result = await downloadAndSaveImage('https://example.com/image.jpg');

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.jpg');
      expect(mockedWriteFileSync).toHaveBeenCalledOnce();
      expect(mockedWriteFileSync.mock.calls[0][0]).toBe('/mock/data/images/test-uuid.png');
      expect(result.filename).toBe('test-uuid.png');
      expect(result.localUrl).toBe('local-file:///test-uuid.png');
    });

    it('uses outputFormat parameter for file extension', async () => {
      const imageData = new ArrayBuffer(8);
      mockFetch.mockResolvedValue(makeFetchResponse(imageData));
      mockedRandomUUID.mockReturnValue('uuid-jpg' as `${string}-${string}-${string}-${string}-${string}`);

      const result = await downloadAndSaveImage('https://example.com/image.webp', 'jpg');

      expect(result.filename).toBe('uuid-jpg.jpg');
      expect(mockedWriteFileSync.mock.calls[0][0]).toBe('/mock/data/images/uuid-jpg.jpg');
    });

    it('defaults to png when no outputFormat is provided', async () => {
      const imageData = new ArrayBuffer(8);
      mockFetch.mockResolvedValue(makeFetchResponse(imageData));
      mockedRandomUUID.mockReturnValue('uuid-default' as `${string}-${string}-${string}-${string}-${string}`);

      const result = await downloadAndSaveImage('https://example.com/image.webp');

      expect(result.filename).toBe('uuid-default.png');
    });

    it('falls back to URL extension when outputFormat is empty string', async () => {
      const imageData = new ArrayBuffer(8);
      mockFetch.mockResolvedValue(makeFetchResponse(imageData));
      mockedRandomUUID.mockReturnValue('uuid-ext' as `${string}-${string}-${string}-${string}-${string}`);

      const result = await downloadAndSaveImage('https://example.com/photo.webp', '');

      expect(result.filename).toBe('uuid-ext.webp');
    });

    it('falls back to png when outputFormat is empty and URL has no extension', async () => {
      const imageData = new ArrayBuffer(8);
      mockFetch.mockResolvedValue(makeFetchResponse(imageData));
      mockedRandomUUID.mockReturnValue('uuid-fallback' as `${string}-${string}-${string}-${string}-${string}`);

      const result = await downloadAndSaveImage('https://example.com/image', '');

      expect(result.filename).toBe('uuid-fallback.png');
    });

    it('throws on network error (non-ok response)', async () => {
      mockFetch.mockResolvedValue(makeFetchResponse(new ArrayBuffer(0), false, 'Not Found'));

      await expect(
        downloadAndSaveImage('https://example.com/missing.png'),
      ).rejects.toThrow('Failed to download image: Not Found');

      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });

    it('throws on fetch rejection (network failure)', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        downloadAndSaveImage('https://example.com/image.png'),
      ).rejects.toThrow('Network error');

      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });
  });

  // ---------- deleteImageFile ----------

  describe('deleteImageFile', () => {
    it('deletes existing file and returns true', () => {
      mockedExistsSync.mockReturnValue(true);

      const result = deleteImageFile('test-image.png');

      expect(result).toBe(true);
      expect(mockedUnlinkSync).toHaveBeenCalledWith('/mock/data/images/test-image.png');
    });

    it('returns false when file does not exist', () => {
      mockedExistsSync.mockReturnValue(false);

      const result = deleteImageFile('missing.png');

      expect(result).toBe(false);
      expect(mockedUnlinkSync).not.toHaveBeenCalled();
    });
  });
});
