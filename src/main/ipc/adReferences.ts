import { listAdReferences, addAdReference, deleteAdReference } from '../services/adReferenceStore';
import { secureHandle } from './validateSender';

interface CreatePayload {
  file: { name: string; buffer: Uint8Array };
  width: number;
  height: number;
  aspectRatio: string;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function registerAdReferenceHandlers(): void {
  secureHandle('adReferences:list', async () => listAdReferences());

  secureHandle('adReferences:create', async (_event, data: CreatePayload) => {
    if (
      !data ||
      !data.file ||
      typeof data.file.name !== 'string' ||
      !data.file.buffer ||
      !isFiniteNumber(data.width) ||
      !isFiniteNumber(data.height) ||
      typeof data.aspectRatio !== 'string'
    ) {
      throw new Error('Invalid ad reference payload');
    }

    return addAdReference(
      { name: data.file.name, buffer: Buffer.from(data.file.buffer) },
      { width: data.width, height: data.height, aspectRatio: data.aspectRatio },
    );
  });

  secureHandle('adReferences:delete', async (_event, id: string) => {
    if (typeof id !== 'string' || !id) return { success: false };
    const success = await deleteAdReference(id);
    return { success };
  });
}
