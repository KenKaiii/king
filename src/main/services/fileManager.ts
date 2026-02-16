import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { getImagesDir } from './paths';

export async function downloadAndSaveImage(
  imageUrl: string,
  outputFormat = 'png',
): Promise<{ filename: string; localUrl: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = outputFormat || extname(new URL(imageUrl).pathname).slice(1) || 'png';
  const filename = `${randomUUID()}.${ext}`;
  const filePath = join(getImagesDir(), filename);

  writeFileSync(filePath, buffer);

  const localUrl = `local-file:///${filename}`;
  return { filename, localUrl };
}

export function deleteImageFile(filename: string): boolean {
  const filePath = join(getImagesDir(), filename);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    return true;
  }
  return false;
}
