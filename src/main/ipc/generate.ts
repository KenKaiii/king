import { ipcMain } from 'electron';

interface GenerateImageData {
  prompt: string;
  aspectRatio: string;
  resolution: string;
  outputFormat: string;
  imageUrls: string[];
}

export function registerGenerateHandlers(): void {
  ipcMain.handle('generate:image', async (_event, data: GenerateImageData) => {
    // Dynamic import to avoid issues with ESM module
    const { fal } = await import('@fal-ai/client');

    const input: Record<string, unknown> = {
      prompt: data.prompt,
      image_size: getImageSize(data.aspectRatio, data.resolution),
      output_format: data.outputFormat || 'png',
      num_images: 1,
      enable_safety_checker: false,
    };

    if (data.imageUrls && data.imageUrls.length > 0) {
      input.image_url = data.imageUrls[0];
    }

    const result = await fal.subscribe('fal-ai/flux/dev', {
      input,
    });

    const resultData = result.data as {
      images?: Array<{ url: string }>;
    };

    const resultUrls =
      resultData.images?.map((img: { url: string }) => img.url) ?? [];

    return { success: true, resultUrls };
  });
}

function getImageSize(
  aspectRatio: string,
  resolution: string,
): { width: number; height: number } {
  const baseSize = resolution === '4K' ? 2048 : resolution === '2K' ? 1536 : 1024;

  const ratioMap: Record<string, [number, number]> = {
    '1:1': [1, 1],
    '2:3': [2, 3],
    '3:2': [3, 2],
    '3:4': [3, 4],
    '4:3': [4, 3],
    '4:5': [4, 5],
    '5:4': [5, 4],
    '9:16': [9, 16],
    '16:9': [16, 9],
    '21:9': [21, 9],
  };

  const [w, h] = ratioMap[aspectRatio] ?? [1, 1];
  if (w === h) return { width: baseSize, height: baseSize };
  if (w > h) return { width: baseSize, height: Math.round(baseSize * (h / w)) };
  return { width: Math.round(baseSize * (w / h)), height: baseSize };
}
