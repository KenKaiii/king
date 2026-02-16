export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
}
