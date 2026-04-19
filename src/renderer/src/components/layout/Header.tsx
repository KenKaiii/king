import type { PageType } from '@/App';

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const navItems: { page: PageType; label: string }[] = [
  { page: 'image', label: 'Image' },
  { page: 'products', label: 'Products' },
  { page: 'characters', label: 'Characters' },
  { page: 'prompts', label: 'Prompts' },
  { page: 'facebook-ads', label: 'Facebook Ads' },
  { page: 'google-ads', label: 'Google Ads' },
  { page: 'tiktok-shop', label: 'TikTok Shop' },
  { page: 'shopee-ads', label: 'Shopee Ads' },
  { page: 'store', label: 'Your Store' },
];

export default function Header({ currentPage, onNavigate }: HeaderProps) {
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
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                  active
                    ? 'border-[var(--base-color-brand--bean)] bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]'
                    : 'border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)] hover:border-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]'
                }`}
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
