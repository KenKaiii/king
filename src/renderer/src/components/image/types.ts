import type { ImageModelId } from '@/types/electron';

export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  /** Absent on legacy records — detail panel falls back to Nano Banana Pro. */
  model?: ImageModelId;
}
