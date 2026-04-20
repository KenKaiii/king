import { useState, memo, useCallback, useMemo } from 'react';
import { prompts, promptCategories, type Prompt, type PromptCategory } from '@/lib/prompts';
import { usePromptUsageStore } from '@/stores/promptUsageStore';

type CategoryFilter = PromptCategory | 'all' | 'mostUsed';

function categoryLabel(id: PromptCategory): string {
  return promptCategories.find((c) => c.id === id)?.label ?? id;
}
import type { PageType } from '@/App';

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className="size-5 shrink-0 text-[var(--base-color-brand--umber)]"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.16634 3.83203C6.22082 3.83203 3.83301 6.21985 3.83301 9.16536C3.83301 12.1109 6.22082 14.4987 9.16634 14.4987C12.1119 14.4987 14.4997 12.1109 14.4997 9.16536C14.4997 6.21985 12.1119 3.83203 9.16634 3.83203ZM2.83301 9.16536C2.83301 5.66756 5.66854 2.83203 9.16634 2.83203C12.6641 2.83203 15.4997 5.66756 15.4997 9.16536C15.4997 10.7343 14.9292 12.17 13.9843 13.2763L18.2699 17.5618C18.4652 17.7571 18.4652 18.0737 18.2699 18.2689C18.0746 18.4642 17.758 18.4642 17.5628 18.2689L13.2772 13.9834C12.1709 14.9282 10.7353 15.4987 9.16634 15.4987C5.66854 15.4987 2.83301 12.6632 2.83301 9.16536Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function CopiedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 13L9 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PromptCard = memo(function PromptCard({
  prompt,
  priority = false,
  onUsePrompt,
}: {
  prompt: Prompt;
  priority?: boolean;
  onUsePrompt: (promptText: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const incrementUsage = usePromptUsageStore((s) => s.incrementUsage);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    incrementUsage(prompt.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt.prompt, prompt.id, incrementUsage]);

  const handleUse = useCallback(() => {
    incrementUsage(prompt.id);
    onUsePrompt(prompt.prompt);
  }, [onUsePrompt, prompt.prompt, prompt.id, incrementUsage]);

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] transition-all duration-200 hover:border-[var(--base-color-brand--umber)] hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-[var(--base-color-brand--shell)]">
        {prompt.image ? (
          <img
            src={prompt.image}
            alt={prompt.title}
            className="h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 text-center"
            style={{
              background:
                'linear-gradient(135deg, var(--base-color-brand--champagne) 0%, var(--base-color-brand--shell) 100%)',
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--base-color-brand--umber)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {categoryLabel(prompt.category)}
            </span>
            <h4
              className="text-xl leading-tight font-bold text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {prompt.title}
            </h4>
            <span className="block h-[3px] w-10 rounded-full bg-[var(--base-color-brand--cinamon)]" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h3
            className="text-base font-semibold text-[var(--base-color-brand--bean)]"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            {prompt.title}
          </h3>
          <p className="line-clamp-2 text-sm text-[var(--base-color-brand--umber)]">
            {prompt.description}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUse}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] font-semibold uppercase tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] transition-all duration-150 hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--base-color-brand--dark-red)]"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            <span className="text-sm">Use Prompt</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--base-color-brand--umber)]/60 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)] transition-all duration-150 hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
            title="Copy prompt"
          >
            {copied ? <CopiedIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
});

interface PromptsPageProps {
  onNavigate: (page: PageType) => void;
  onUsePrompt: (promptText: string) => void;
}

export default function PromptsPage({ onNavigate, onUsePrompt }: PromptsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const usageCounts = usePromptUsageStore((s) => s.counts);

  const categoryTabs = useMemo(
    () => [
      { id: 'all' as CategoryFilter, label: 'All' },
      { id: 'mostUsed' as CategoryFilter, label: 'Most Used' },
      ...promptCategories
        .filter((c) => c.id !== 'all')
        .map((c) => ({ id: c.id as CategoryFilter, label: c.label })),
    ],
    [],
  );

  const filteredPrompts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const bySearch = prompts.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(q) || prompt.description.toLowerCase().includes(q),
    );

    if (activeCategory === 'mostUsed') {
      return bySearch
        .filter((p) => (usageCounts[p.id] ?? 0) > 0)
        .sort((a, b) => (usageCounts[b.id] ?? 0) - (usageCounts[a.id] ?? 0));
    }

    if (activeCategory === 'all') return bySearch;
    return bySearch.filter((p) => p.category === activeCategory);
  }, [searchQuery, activeCategory, usageCounts]);

  const handleUsePrompt = useCallback(
    (promptText: string) => {
      onUsePrompt(promptText);
      onNavigate('image');
    },
    [onUsePrompt, onNavigate],
  );

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 pt-8 pb-8 md:px-10">
        {/* Header */}
        <section className="flex flex-col gap-3">
          <h2
            className="text-4xl font-bold tracking-tight text-[var(--base-color-brand--bean)] uppercase sm:text-5xl"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            Prompt <span className="text-[var(--base-color-brand--cinamon)]">Gallery</span>
          </h2>
          <p className="text-sm text-[var(--base-color-brand--umber)]">
            Pre-made prompts ready to go. Click one and hit generate.
          </p>
        </section>

        {/* Search */}
        <section>
          <label className="relative flex h-11 w-full items-center gap-2 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-3 transition-colors focus-within:border-[var(--base-color-brand--bean)] sm:max-w-[320px]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--text-color--text-primary)] outline-none placeholder:text-[var(--base-color-brand--umber)]/70"
            />
          </label>
        </section>

        {/* Grid */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              className="text-lg font-bold tracking-wide text-[var(--base-color-brand--bean)] uppercase"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              Product Prompts
            </h2>
            <p className="text-sm whitespace-nowrap text-[var(--base-color-brand--umber)]">
              {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div
            className="-mx-1 flex gap-1 overflow-x-auto rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Prompt categories"
          >
            {categoryTabs.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-colors duration-150 ${
                    isActive
                      ? 'bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]'
                      : 'text-[var(--base-color-brand--umber)] hover:bg-[var(--base-color-brand--champagne)] hover:text-[var(--base-color-brand--bean)]'
                  }`}
                  style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredPrompts.map((prompt, index) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                priority={index < 10}
                onUsePrompt={handleUsePrompt}
              />
            ))}
          </div>
          {filteredPrompts.length === 0 && (
            <p className="py-12 text-center text-sm text-[var(--base-color-brand--umber)]">
              {activeCategory === 'mostUsed'
                ? 'No prompts used yet. Use or copy a prompt to start tracking.'
                : 'No prompts match your filters.'}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
