import { randomUUID } from 'crypto';
import { listImages, addImage, deleteImage, getImage } from '../services/imageStore';
import { downloadAndSaveImage, deleteImageFile } from '../services/fileManager';
import { secureHandle } from './validateSender';

export function registerImageHandlers(): void {
  secureHandle('images:list', async (_event, cursor?: string, limit?: number) => {
    return listImages(cursor, limit);
  });

  secureHandle(
    'images:save',
    async (_event, data: { url: string; prompt: string; aspectRatio: string }) => {
      const { filename, localUrl } = await downloadAndSaveImage(data.url);
      const image = await addImage({
        id: randomUUID(),
        url: localUrl,
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        createdAt: new Date().toISOString(),
        filename,
      });
      return image;
    },
  );

  secureHandle('images:delete', async (_event, id: string) => {
    const image = await getImage(id);
    if (image) {
      deleteImageFile(image.filename);
    }
    const success = await deleteImage(id);
    return { success };
  });
}
