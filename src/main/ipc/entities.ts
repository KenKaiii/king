import { ipcMain } from 'electron';
import {
  listEntities,
  addEntity,
  updateEntity,
  deleteEntity,
  saveEntityImages,
} from '../services/entityStore';

const VALID_TYPES = ['characters', 'products'];

function validateType(entityType: string): boolean {
  return VALID_TYPES.includes(entityType);
}

export function registerEntityHandlers(): void {
  ipcMain.handle('entities:list', async (_event, entityType: string) => {
    if (!validateType(entityType)) return [];
    return listEntities(entityType);
  });

  ipcMain.handle(
    'entities:create',
    async (
      _event,
      entityType: string,
      data: {
        name: string;
        files: { name: string; buffer: Uint8Array }[];
        productType?: string;
      },
    ) => {
      if (!validateType(entityType)) throw new Error('Invalid entity type');

      const buffers = data.files.map((f) => ({
        name: f.name,
        buffer: Buffer.from(f.buffer),
      }));
      const imageUrls = saveEntityImages(entityType, buffers);
      return addEntity(entityType, data.name, imageUrls, data.productType);
    },
  );

  ipcMain.handle(
    'entities:update',
    async (
      _event,
      entityType: string,
      id: string,
      data: {
        name: string;
        existingImages: string[];
        newFiles: { name: string; buffer: Uint8Array }[];
        productType?: string;
      },
    ) => {
      if (!validateType(entityType)) throw new Error('Invalid entity type');

      let newUrls: string[] = [];
      if (data.newFiles.length > 0) {
        const buffers = data.newFiles.map((f) => ({
          name: f.name,
          buffer: Buffer.from(f.buffer),
        }));
        newUrls = saveEntityImages(entityType, buffers);
      }

      const allImages = [...data.existingImages, ...newUrls];
      const updated = updateEntity(entityType, id, data.name, allImages, data.productType);
      if (!updated) throw new Error('Entity not found');
      return updated;
    },
  );

  ipcMain.handle('entities:delete', async (_event, entityType: string, id: string) => {
    if (!validateType(entityType)) return { success: false };
    const success = deleteEntity(entityType, id);
    return { success };
  });
}
