import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGenerationStore } from '@/stores/generationStore';

describe('generationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state before each test
    useGenerationStore.setState({ pendingImageGenerations: [] });
  });

  describe('addImageGeneration', () => {
    it('adds an entry with the correct shape', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      useGenerationStore.getState().addImageGeneration('gen-1', 'a cat on mars');

      const pending = useGenerationStore.getState().pendingImageGenerations;
      expect(pending).toHaveLength(1);
      expect(pending[0]).toEqual({
        id: 'gen-1',
        type: 'image',
        startedAt: now,
        prompt: 'a cat on mars',
      });
    });

    it('adds an entry without a prompt', () => {
      useGenerationStore.getState().addImageGeneration('gen-2');

      const pending = useGenerationStore.getState().pendingImageGenerations;
      expect(pending).toHaveLength(1);
      expect(pending[0]).toMatchObject({
        id: 'gen-2',
        type: 'image',
      });
      expect(pending[0].prompt).toBeUndefined();
    });

    it('tracks multiple additions', () => {
      const { addImageGeneration } = useGenerationStore.getState();
      addImageGeneration('gen-1', 'prompt one');
      addImageGeneration('gen-2', 'prompt two');
      addImageGeneration('gen-3', 'prompt three');

      const pending = useGenerationStore.getState().pendingImageGenerations;
      expect(pending).toHaveLength(3);
      expect(pending.map((g) => g.id)).toEqual(['gen-1', 'gen-2', 'gen-3']);
    });
  });

  describe('removeImageGeneration', () => {
    it('removes only the matching id and preserves others', () => {
      const store = useGenerationStore.getState();
      store.addImageGeneration('gen-1', 'first');
      store.addImageGeneration('gen-2', 'second');
      store.addImageGeneration('gen-3', 'third');

      useGenerationStore.getState().removeImageGeneration('gen-2');

      const pending = useGenerationStore.getState().pendingImageGenerations;
      expect(pending).toHaveLength(2);
      expect(pending.map((g) => g.id)).toEqual(['gen-1', 'gen-3']);
    });

    it('does not error when removing a non-existent id', () => {
      const store = useGenerationStore.getState();
      store.addImageGeneration('gen-1', 'keep me');

      // Should not throw
      useGenerationStore.getState().removeImageGeneration('does-not-exist');

      const pending = useGenerationStore.getState().pendingImageGenerations;
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe('gen-1');
    });

    it('leaves state unchanged when removing from an empty list', () => {
      useGenerationStore.getState().removeImageGeneration('nope');

      const pending = useGenerationStore.getState().pendingImageGenerations;
      expect(pending).toEqual([]);
    });
  });

  describe('clearImageGenerations', () => {
    it('empties the pending array', () => {
      const store = useGenerationStore.getState();
      store.addImageGeneration('gen-1');
      store.addImageGeneration('gen-2');
      store.addImageGeneration('gen-3');

      expect(useGenerationStore.getState().pendingImageGenerations).toHaveLength(3);

      useGenerationStore.getState().clearImageGenerations();

      expect(useGenerationStore.getState().pendingImageGenerations).toEqual([]);
    });

    it('is safe to call on an already empty list', () => {
      useGenerationStore.getState().clearImageGenerations();
      expect(useGenerationStore.getState().pendingImageGenerations).toEqual([]);
    });
  });
});
