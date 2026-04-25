import {
  existsSync,
  openSync,
  writeFileSync,
  closeSync,
  fsyncSync,
  renameSync,
  readFileSync,
  unlinkSync,
} from 'fs';
import { randomBytes } from 'crypto';

/**
 * Atomic JSON read/write with per-path serialization.
 *
 * Two problems this solves:
 *   1. `writeFileSync(path, json)` is NOT atomic \u2014 a crash mid-write corrupts
 *      the file. We write to a temp sibling + fsync + rename (rename is atomic
 *      on POSIX and on NTFS as long as src/dst are on the same volume).
 *   2. Read-modify-write races. Concurrent `addImage` calls from
 *      `Promise.all` on the Clone page were losing records because each one
 *      read the same baseline store, mutated it, then overwrote the previous
 *      write. A per-path async mutex funnels them through a queue so each
 *      mutation sees the latest on-disk state.
 */

const locks: Map<string, Promise<unknown>> = new Map();

/**
 * Run `fn` while holding the lock for `path`. Other callers for the same
 * path queue behind this one. Resolves / rejects with whatever `fn` returns.
 */
export function withJsonLock<T>(path: string, fn: () => Promise<T> | T): Promise<T> {
  const previous = locks.get(path) ?? Promise.resolve();
  const next = previous
    .then(() => fn())
    .catch((err) => {
      // Re-throw so the caller sees the error, but don't let it poison the
      // chain \u2014 the next queued task should still run against a fresh read.
      throw err;
    });
  // Swallow errors on the chain node we store so subsequent `.then` links
  // don't get skipped by a rejection upstream.
  locks.set(
    path,
    next.catch(() => undefined),
  );
  return next;
}

export function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonAtomic(path: string, value: unknown): void {
  const json = JSON.stringify(value, null, 2);
  const tmp = `${path}.tmp.${process.pid}.${randomBytes(6).toString('hex')}`;
  // Open+write+fsync gives us durability of the temp file's contents before
  // we rename. Without fsync a crash after rename could still yield an empty
  // file on disk (directory entry updated, data not flushed).
  const fd = openSync(tmp, 'w');
  try {
    writeFileSync(fd, json, 'utf-8');
    try {
      fsyncSync(fd);
    } catch {
      // Some filesystems (e.g. certain network mounts) refuse fsync. Best
      // effort \u2014 the rename is still atomic.
    }
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(tmp, path);
  } catch (err) {
    // Clean up the orphan temp file so we don't leak it on repeated errors.
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw err;
  }
}
