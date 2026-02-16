import { useState, memo, useCallback } from 'react';
import { prompts, type Prompt } from '@/lib/prompts';
import type { PageType } from '@/App';

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="size-5 shrink-0 text-zinc-400">
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

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt.prompt]);

  const handleUse = useCallback(() => {
    onUsePrompt(prompt.prompt);
  }, [onUsePrompt, prompt.prompt]);

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/50">
      <div className="relative aspect-square overflow-hidden bg-zinc-800">
        <img
          src={prompt.image}
          alt={prompt.title}
          className="h-full w-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-white">{prompt.title}</h3>
          <p className="line-clamp-2 text-sm text-zinc-300">{prompt.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUse}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-white font-medium text-black shadow-[0_4px_0_0_#a1a1aa] transition-all duration-150 hover:bg-zinc-100 hover:shadow-[0_4px_0_0_#8b8b94] active:translate-y-0.5 active:shadow-[0_2px_0_0_#a1a1aa]"
          >
            <span className="text-sm">Use Prompt</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-black shadow-[0_4px_0_0_#a1a1aa] transition-all duration-150 hover:bg-zinc-100 hover:shadow-[0_4px_0_0_#8b8b94] active:translate-y-0.5 active:shadow-[0_2px_0_0_#a1a1aa]"
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

  const filteredPrompts = prompts.filter((prompt) => {
    const q = searchQuery.toLowerCase();
    return prompt.title.toLowerCase().includes(q) || prompt.description.toLowerCase().includes(q);
  });

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
          <h2 className="text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
            Prompt <span className="text-pink-400">Gallery</span>
          </h2>
          <p className="text-sm text-zinc-300">
            Pre-made prompts ready to go. Click one and hit generate.
          </p>
        </section>

        {/* Search */}
        <section>
          <label className="relative flex h-11 w-full items-center gap-2 rounded-xl border border-transparent bg-white/[0.04] px-3 py-3 transition-colors focus-within:border-white/20 focus-within:bg-white/10 sm:max-w-[320px]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-400"
            />
          </label>
        </section>

        {/* Grid */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-wide text-white uppercase">
              Product Prompts
            </h2>
            <p className="text-sm text-zinc-300">
              {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}
            </p>
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
        </section>
      </div>
    </main>
  );
}
