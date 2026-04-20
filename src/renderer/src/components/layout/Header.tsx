import { useEffect, useRef, useState } from 'react';
import type { PageType } from '@/App';
import { ChevronDownIcon } from '@/components/icons';

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const navItems: { page: PageType; label: string }[] = [
  { page: 'image', label: 'Image' },
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
          <h1 className="font-display text-2xl leading-none tracking-tight text-[var(--base-color-brand--bean)]">
            King
          </h1>
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
        <button onClick={() => onNavigate('apis')} className="btn-cinamon btn-sm no-drag ml-auto">
          APIs
        </button>
      </header>
    </>
  );
}
