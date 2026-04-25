import { app } from 'electron';
import { join, normalize, relative, isAbsolute } from 'path';
import { mkdirSync } from 'fs';

let dataDir: string;
let imagesDir: string;

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function getDataDir(): string {
  if (!dataDir) {
    dataDir = join(app.getPath('userData'), 'data');
    ensureDir(dataDir);
  }
  return dataDir;
}

export function getImagesDir(): string {
  if (!imagesDir) {
    imagesDir = join(getDataDir(), 'images');
    ensureDir(imagesDir);
  }
  return imagesDir;
}

export function getImagesJsonPath(): string {
  return join(getDataDir(), 'images.json');
}

export function getEntityImagesDir(entityType: string): string {
  const dir = join(getImagesDir(), 'entities', entityType);
  ensureDir(dir);
  return dir;
}

export function getEntityJsonPath(entityType: string): string {
  return join(getDataDir(), `${entityType}.json`);
}

/**
 * Resolve a `local-file://` URL to an absolute filesystem path, enforcing
 * containment under the images directory. Returns `null` for malformed URLs,
 * non-`local-file://` schemes, or anything that escapes the root via `..`
 * traversal. All callers that turn a `local-file://` URL into a path must go
 * through this helper.
 */
export function resolveLocalFileUrl(urlString: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'local-file:') return null;

  const root = getImagesDir();
  // Chromium canonicalises `local-file:///foo.png` (3 slashes, empty
  // host) into `local-file://foo.png/` (2 slashes, host = 'foo.png',
  // pathname = '/') because `local-file` is registered as a `standard`
  // scheme. Same for nested URLs: `local-file:///entities/foo.png`
  // becomes host = 'entities', pathname = '/foo.png'.
  //
  // Re-merge them so both legacy 3-slash URLs and Chromium-normalised
  // 2-slash URLs resolve to the same file. Trim a trailing slash on
  // pathname so single-segment URLs (`local-file://foo.png/`) resolve
  // to `<root>/foo.png` and not `<root>/foo.png/`.
  const host = parsed.host ? decodeURIComponent(parsed.host) : '';
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  const fullPath = host ? (pathname === '/' ? `/${host}` : `/${host}${pathname}`) : pathname;
  const resolved = normalize(join(root, fullPath));
  // `path.relative` is the canonical CWE-22 mitigation: it handles drive
  // letters, UNC paths, and case-insensitive filesystem edge cases that a
  // plain `startsWith` comparison misses on Windows. A relative path that is
  // empty (exact-equal to root), starts with `..` (parent escape), or is
  // absolute (different drive / UNC host) is rejected.
  const rel = relative(root, resolved);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) return null;
  return resolved;
}
