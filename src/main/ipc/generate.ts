import { ipcMain } from 'electron';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { getImagesDir } from '../services/paths';

const NANO_BANANA_PRO_MODEL = 'fal-ai/nano-banana-pro';
const NANO_BANANA_PRO_EDIT_MODEL = 'fal-ai/nano-banana-pro/edit';

interface GenerateImageData {
  prompt: string;
  aspectRatio: string;
  resolution: string;
  outputFormat: string;
  imageUrls: string[];
}

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function resolveImageUrl(url: string): string {
  if (url.startsWith('data:') || url.startsWith('http')) return url;

  if (url.startsWith('local-file://')) {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const filePath = join(getImagesDir(), pathname);
    const buffer = readFileSync(filePath);
    const ext = extname(pathname).toLowerCase();
    const mime = MIME_TYPES[ext] || 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  return url;
}

export function registerGenerateHandlers(): void {
  ipcMain.handle('generate:image', async (_event, data: GenerateImageData) => {
    const { fal } = await import('@fal-ai/client');

    const resolvedUrls = (data.imageUrls || [])
      .map(resolveImageUrl)
      .filter((u) => u.startsWith('data:') || u.startsWith('http'));

    const hasReferenceImages = resolvedUrls.length > 0;
    const model = hasReferenceImages ? NANO_BANANA_PRO_EDIT_MODEL : NANO_BANANA_PRO_MODEL;

    const input: Record<string, unknown> = {
      prompt: data.prompt,
      aspect_ratio: data.aspectRatio || '1:1',
      resolution: data.resolution || '1K',
      output_format: data.outputFormat || 'png',
      num_images: 1,
    };

    if (hasReferenceImages) {
      input.image_urls = resolvedUrls;
    }

    const result = await fal.subscribe(model, { input, logs: true });

    const resultData = result.data as {
      images?: Array<{ url: string }>;
    };

    const resultUrls = resultData.images?.map((img: { url: string }) => img.url) ?? [];

    return { success: true, resultUrls };
  });
}
