import { describe, it, expect } from 'vitest';
import {
  MAX_REFERENCE_IMAGES,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGES_PER_GENERATION,
  modelOptions,
  aspectRatioOptions,
  resolutionOptions,
  outputFormatOptions,
} from '@/lib/constants/image-form';

describe('image-form constants', () => {
  describe('numeric constants', () => {
    it('MAX_REFERENCE_IMAGES is 8', () => {
      expect(MAX_REFERENCE_IMAGES).toBe(8);
    });

    it('MAX_IMAGE_SIZE_MB is 30', () => {
      expect(MAX_IMAGE_SIZE_MB).toBe(30);
    });

    it('MAX_IMAGES_PER_GENERATION is 4', () => {
      expect(MAX_IMAGES_PER_GENERATION).toBe(4);
    });
  });

  describe('modelOptions', () => {
    it('is non-empty', () => {
      expect(modelOptions.length).toBeGreaterThan(0);
    });

    it('each option has value and label properties', () => {
      for (const option of modelOptions) {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      }
    });

    it('contains the Default model', () => {
      expect(modelOptions).toContainEqual({ value: 'nano_banana_2', label: 'Default' });
    });
  });

  describe('aspectRatioOptions', () => {
    it('is non-empty', () => {
      expect(aspectRatioOptions.length).toBeGreaterThan(0);
    });

    it('each option has value and label properties', () => {
      for (const option of aspectRatioOptions) {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      }
    });

    it('includes auto and common ratios', () => {
      const values = aspectRatioOptions.map((o) => o.value);
      expect(values).toContain('auto');
      expect(values).toContain('1:1');
      expect(values).toContain('16:9');
      expect(values).toContain('9:16');
    });
  });

  describe('resolutionOptions', () => {
    it('is non-empty', () => {
      expect(resolutionOptions.length).toBeGreaterThan(0);
    });

    it('each option has value and label properties', () => {
      for (const option of resolutionOptions) {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      }
    });

    it('includes 1K, 2K, and 4K', () => {
      const values = resolutionOptions.map((o) => o.value);
      expect(values).toContain('1K');
      expect(values).toContain('2K');
      expect(values).toContain('4K');
    });
  });

  describe('outputFormatOptions', () => {
    it('is non-empty', () => {
      expect(outputFormatOptions.length).toBeGreaterThan(0);
    });

    it('each option has value and label properties', () => {
      for (const option of outputFormatOptions) {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      }
    });

    it('includes png, jpeg, and webp', () => {
      const values = outputFormatOptions.map((o) => o.value);
      expect(values).toContain('png');
      expect(values).toContain('jpeg');
      expect(values).toContain('webp');
    });
  });
});
