import { useEffect, useRef, useState } from 'react';
import type { PageType } from '@/App';
import { ChevronDownIcon, SettingsIcon } from '@/components/icons';
import SettingsModal from '@/components/ui/SettingsModal';
import { DemoToggle } from '@/components/ui/DemoToggle';

// Baked in at build time from package.json via electron.vite.config.ts.
const APP_VERSION = __APP_VERSION__;

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const navItems: { page: PageType; label: string }[] = [
  { page: 'image', label: 'Image' },
  { page: 'create-ads', label: 'Create Ads' },
  { page: 'clone', label: 'Clone' },
  { page: 'prompts', label: 'Prompts' },
  { page: 'products', label: 'Products' },
  { page: 'characters', label: 'Characters' },
];

const adsItems: { page: PageType; label: string }[] = [
  { page: 'facebook-ads', label: 'Facebook Ads' },
  { page: 'google-ads', label: 'Google Ads' },
  { page: 'tiktok-shop', label: 'TikTok Shop' },
  { page: 'shopee-ads', label: 'Shopee Ads' },
];

const trailingItems: { page: PageType; label: string }[] = [{ page: 'store', label: 'Your Store' }];

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [adsOpen, setAdsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const adsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adsRef.current && !adsRef.current.contains(event.target as Node)) {
        setAdsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adsActive = adsItems.some((item) => item.page === currentPage);
  const activeAdsLabel = adsItems.find((item) => item.page === currentPage)?.label;

  const navButtonClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
      active
        ? 'border-[var(--base-color-brand--bean)] bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]'
        : 'border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)] hover:border-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]'
    }`;

  return (
    <>
      {/* Draggable title bar area — sits behind the native traffic light buttons */}
      <div className="drag-region h-7 shrink-0 bg-[var(--base-color-brand--shell)]" />
      {/* Actual header content below the title bar */}
      <header className="flex h-14 shrink-0 items-center border-b border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] px-4">
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl leading-none font-black tracking-tight text-[var(--base-color-brand--bean)]"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            King
          </h1>
          {/* Version badge next to the wordmark. Version is baked in at build
              time so it renders immediately, with no IPC dependency. */}
          <span
            className="inline-flex items-center rounded-full border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--champagne)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--base-color-brand--bean)]"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            title={`King v${APP_VERSION}`}
          >
            v{APP_VERSION}
          </span>
        </div>
        <nav className="ml-6 flex items-center gap-2">
          {navItems.map(({ page, label }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={navButtonClass(active)}
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                {label}
              </button>
            );
          })}

          <div ref={adsRef} className="relative">
            <button
              onClick={() => setAdsOpen((prev) => !prev)}
              className={`${navButtonClass(adsActive)} flex items-center gap-1.5`}
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              aria-haspopup="menu"
              aria-expanded={adsOpen}
            >
              <span>{activeAdsLabel ?? 'Ads'}</span>
              <ChevronDownIcon />
            </button>
            {adsOpen && (
              <div
                role="menu"
                className="absolute top-full left-0 z-50 mt-2 flex min-w-[180px] flex-col overflow-hidden rounded-2xl border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--champagne)] p-1 shadow-lg"
              >
                {adsItems.map(({ page, label }) => {
                  const active = currentPage === page;
                  return (
                    <button
                      key={page}
                      role="menuitem"
                      onClick={() => {
                        onNavigate(page);
                        setAdsOpen(false);
                      }}
                      className={`rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide transition-colors ${
                        active
                          ? 'bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]'
                          : 'text-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--shell)]'
                      }`}
                      style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {trailingItems.map(({ page, label }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={navButtonClass(active)}
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                {label}
              </button>
            );
          })}
        </nav>
        <div className="no-drag ml-auto flex items-center gap-2">
          {/* Master demo-mode switch. Dev-only — `import.meta.env.DEV` is
              statically replaced at build time, so the entire <DemoToggle/>
              import + component drops out of production bundles via Vite
              tree-shaking. End users in shipped releases never see the toggle,
              and the underlying localStorage default is OFF anyway. */}
          {import.meta.env.DEV && <DemoToggle />}
          <button onClick={() => onNavigate('apis')} className="btn-cinamon btn-sm">
            APIs
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            className="flex items-center justify-center rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] p-2 text-[var(--base-color-brand--bean)] transition-colors hover:border-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </header>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
