import { useEffect, useState, useCallback } from 'react';

/**
 * Global "demo mode" toggle.
 *
 * One source of truth (`localStorage[DEMO_KEY]`) shared across every page that
 * supports a demo view. Components subscribe via `useDemoMode()`; flipping the
 * switch in any component is broadcast to every other mounted listener via a
 * custom event (because `storage` events fire only across documents, not
 * within the same document).
 *
 * Default is `false`. Release builds ship with no localStorage entry, so a
 * fresh install / CI build always boots into real-data mode \u2014 demo data
 * never leaks into a screenshotable production state without explicit opt-in.
 */

export const DEMO_KEY = 'king:demoMode';
const CHANGE_EVENT = 'king:demoMode:change';

function readFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DEMO_KEY) === '1';
  } catch {
    return false;
  }
}

function writeFlag(on: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DEMO_KEY, on ? '1' : '0');
  } catch {
    /* private mode etc. \u2014 ignore */
  }
}

interface ChangeDetail {
  on: boolean;
}

/**
 * Subscribe to the demo flag. Returns `[on, setOn]` where `setOn` updates
 * localStorage and notifies every other mounted listener in the same document.
 */
export function useDemoMode(): [boolean, (next: boolean) => void] {
  const [on, setOn] = useState<boolean>(() => readFlag());

  useEffect(() => {
    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent<ChangeDetail>).detail;
      setOn(!!detail?.on);
    };
    // `storage` event fires when *another window* changes localStorage \u2014
    // we listen to it too so detached devtools / future multi-window setups
    // stay in sync.
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DEMO_KEY) setOn(e.newValue === '1');
    };
    window.addEventListener(CHANGE_EVENT, handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setDemoMode = useCallback((next: boolean) => {
    writeFlag(next);
    window.dispatchEvent(new CustomEvent<ChangeDetail>(CHANGE_EVENT, { detail: { on: next } }));
  }, []);

  return [on, setDemoMode];
}
