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
  { page: 'store', label: 'Store' },
  { page: 'apis', label: 'APIs' },
];

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <>
      {/* Draggable title bar area — sits behind the native traffic light buttons */}
      <div className="drag-region h-7 shrink-0" />
      {/* Actual header content below the title bar */}
      <header className="flex h-12 shrink-0 items-center border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <h1 className="gradient-shift text-sm font-bold tracking-wide uppercase">
            Ecomm King
          </h1>
        </div>
        <nav className="ml-6 flex gap-1">
          {navItems.map(({ page, label }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
    </>
  );
}
