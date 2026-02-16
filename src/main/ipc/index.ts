import { registerImageHandlers } from './images';
import { registerGenerateHandlers } from './generate';
import { registerFileHandlers } from './files';
import { registerEntityHandlers } from './entities';
import { registerApiKeyHandlers } from './apiKeys';

export function registerIpcHandlers(): void {
  registerImageHandlers();
  registerGenerateHandlers();
  registerFileHandlers();
  registerEntityHandlers();
  registerApiKeyHandlers();
}
