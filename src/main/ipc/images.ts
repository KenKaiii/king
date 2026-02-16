import { ipcMain } from 'electron';
import { randomUUID } from 'crypto';
import { listImages, addImage, deleteImage, getImage } from '../services/imageStore';
import { downloadAndSaveImage, deleteImageFile } from '../services/fileManager';

export function registerImageHandlers(): void {
  ipcMain.handle('images:list', async (_event, cursor?: string, limit?: number) => {
    return listImages(cursor, limit);
  });

  ipcMain.handle(
    'images:save',
    async (_event, data: { url: string; prompt: string; aspectRatio: string }) => {
      const { filename, localUrl } = await downloadAndSaveImage(data.url);
      const image = addImage({
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

  ipcMain.handle('images:delete', async (_event, id: string) => {
    const image = getImage(id);
    if (image) {
      deleteImageFile(image.filename);
    }
    const success = deleteImage(id);
    return { success };
  });
}
