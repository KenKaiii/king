import { useState } from 'react';
import { toast } from 'sonner';

interface ImageDetailPanelProps {
  image: {
    id: string;
    url: string;
    prompt: string;
    aspectRatio: string;
    createdAt: string;
  };
  onClose: () => void;
  onDelete: (id: string) => void;
  onDownload: (url: string, prompt: string) => void;
  onRecreate: (prompt: string) => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4.75 4.75L19.25 19.25M19.25 4.75L4.75 19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const PromptIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M3.75 5C3.33579 5 3 5.33579 3 5.75C3 6.16421 3.33579 6.5 3.75 6.5H20.25C20.6642 6.5 21 6.16421 21 5.75C21 5.33579 20.6642 5 20.25 5H3.75Z"
      fill="currentColor"
    />
    <path
      d="M17.6708 10.1646C17.5438 9.9105 17.2841 9.75 17 9.75C16.7159 9.75 16.4562 9.9105 16.3292 10.1646L14.941 12.941L12.1646 14.3292C11.9105 14.4562 11.75 14.7159 11.75 15C11.75 15.2841 11.9105 15.5438 12.1646 15.6708L14.941 17.059L16.3292 19.8354C16.4562 20.0895 16.7159 20.25 17 20.25C17.2841 20.25 17.5438 20.0895 17.6708 19.8354L19.059 17.059L21.8354 15.6708C22.0895 15.5438 22.25 15.2841 22.25 15C22.25 14.7159 22.0895 14.4562 21.8354 14.3292L19.059 12.941L17.6708 10.1646Z"
      fill="currentColor"
    />
    <path
      d="M3.75 11.25C3.33579 11.25 3 11.5858 3 12C3 12.4142 3.33579 12.75 3.75 12.75H9.25C9.66421 12.75 10 12.4142 10 12C10 11.5858 9.66421 11.25 9.25 11.25H3.75Z"
      fill="currentColor"
    />
    <path
      d="M3.75 17.5C3.33579 17.5 3 17.8358 3 18.25C3 18.6642 3.33579 19 3.75 19H7.25C7.66421 19 8 18.6642 8 18.25C8 17.8358 7.66421 17.5 7.25 17.5H3.75Z"
      fill="currentColor"
    />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM10 11C10 10.5858 10.3358 10.25 10.75 10.25H12C12.4142 10.25 12.75 10.5858 12.75 11L12.75 16.25C12.75 16.6642 12.4142 17 12 17C11.5858 17 11.25 16.6642 11.25 16.25L11.25 11.75H10.75C10.3358 11.75 10 11.4142 10 11ZM12 7.25C11.5858 7.25 11.25 7.58579 11.25 8C11.25 8.41421 11.5858 8.75 12 8.75C12.4142 8.75 12.75 8.41421 12.75 8C12.75 7.58579 12.4142 7.25 12 7.25Z"
      fill="currentColor"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M13.75 7H3.75M13.75 7C13.75 5.20437 15.2044 3.75 17 3.75C18.7956 3.75 20.25 5.20437 20.25 7C20.25 8.79563 18.7956 10.25 17 10.25C15.2044 10.25 13.75 8.79563 13.75 7ZM20.25 17H12.25M12.25 17C12.25 18.7956 10.7956 20.25 9 20.25C7.20438 20.25 5.75 18.7956 5.75 17M12.25 17C12.25 15.2044 10.7956 13.75 9 13.75C7.20438 13.75 5.75 15.2044 5.75 17M5.75 17H3.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 9L12.7071 16.2929C12.3166 16.6834 11.6834 16.6834 11.2929 16.2929L4 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RecreateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.976 8.08301C14.3902 8.08301 14.726 8.41879 14.726 8.83301V10.833C14.7259 11.9834 13.7934 12.9158 12.6429 12.916H4.61951L5.33923 13.6357C5.63205 13.9286 5.6321 14.4034 5.33923 14.6963C5.04636 14.9891 4.57156 14.9891 4.27869 14.6963L2.6322 13.0498C2.14443 12.5616 2.14426 11.7703 2.6322 11.2822L4.27869 9.63574C4.57147 9.34296 5.04631 9.34317 5.33923 9.63574C5.63206 9.92864 5.6321 10.4034 5.33923 10.6963L4.61951 11.416H12.6429C12.9649 11.4158 13.2259 11.155 13.226 10.833V8.83301C13.226 8.41879 13.5617 8.08301 13.976 8.08301ZM11.6127 1.30273C11.9056 1.01001 12.3804 1.0099 12.6732 1.30273L14.3197 2.94922C14.8075 3.43733 14.8076 4.22872 14.3197 4.7168L12.6732 6.36328C12.3804 6.65602 11.9056 6.65592 11.6127 6.36328C11.3198 6.07041 11.3198 5.59563 11.6127 5.30273L12.3324 4.58301H4.30896C3.98705 4.58318 3.72613 4.84411 3.72595 5.16602V6.83301C3.72588 7.24716 3.39012 7.58301 2.97595 7.58301C2.56179 7.58301 2.22603 7.24716 2.22595 6.83301V5.16602C2.22613 4.01568 3.15862 3.08318 4.30896 3.08301H12.3324L11.6127 2.36328C11.3198 2.07041 11.3198 1.59563 11.6127 1.30273Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.25 14.75V19.25C20.25 19.8023 19.8023 20.25 19.25 20.25H4.75C4.19772 20.25 3.75 19.8023 3.75 19.25V14.75M12 15V3.75M12 15L8.5 11.5M12 15L15.5 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M4.75 6.5L5.72041 20.32C5.7572 20.8439 6.19286 21.25 6.71796 21.25H17.282C17.8071 21.25 18.2428 20.8439 18.2796 20.32L19.25 6.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.25 5.75H20.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5246 5.58289C8.73079 3.84652 10.2081 2.5 12 2.5C13.7919 2.5 15.2692 3.84652 15.4754 5.58289"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 10.5V16.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 10.5V16.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ImageDetailPanel({
  image,
  onClose,
  onDelete,
  onDownload,
  onRecreate,
}: ImageDetailPanelProps) {
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    toast.success('Prompt copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDimensions = () => {
    const [w, h] = image.aspectRatio.split(':').map(Number);
    if (!w || !h) return '1024x1024';
    const base = 1024;
    if (w === h) return `${base}x${base}`;
    if (w > h) return `${base}x${Math.round(base * (h / w))}`;
    return `${Math.round(base * (w / h))}x${base}`;
  };

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_1fr] border-l border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)]">
      <header className="grid grid-cols-[1fr_auto] px-3 pt-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative size-10 overflow-hidden rounded-full bg-[var(--base-color-brand--shell)]">
            <img src={image.url} alt="thumbnail" className="size-full object-cover" />
          </div>
          <div>
            <h2
              className="text-sm font-semibold text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              Image Details
            </h2>
            <p className="text-xs text-[var(--base-color-brand--umber)]">
              {image.aspectRatio} aspect ratio
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="grid min-h-0 grid-rows-[1fr_auto]">
        <div className="hide-scrollbar overflow-y-auto">
          <div className="flex flex-col gap-4 px-3 py-4">
            {/* Prompt Section */}
            <section className="rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--base-color-brand--umber)]">
                    <PromptIcon />
                  </span>
                  <p className="text-xs font-semibold text-[var(--base-color-brand--umber)] tracking-wider">
                    Prompt
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-3 py-1.5 text-xs font-semibold text-[var(--base-color-brand--bean)] tracking-wide transition-colors hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
                >
                  Copy
                </button>
              </div>
              <div className="px-4 pb-4">
                <p className="text-sm break-words text-[var(--text-color--text-primary)]">
                  {image.prompt}
                </p>
              </div>
            </section>

            {/* Information Section */}
            <section className="rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)]">
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="text-[var(--base-color-brand--umber)]">
                  <InfoIcon />
                </span>
                <p className="text-xs font-semibold text-[var(--base-color-brand--umber)] tracking-wider">
                  Information
                </p>
              </div>
              <div className="border-t border-[var(--base-color-brand--umber)]/20">
                <div className="grid grid-cols-[1fr_auto] px-4 py-3.5">
                  <p className="text-sm text-[var(--base-color-brand--umber)]">Model</p>
                  <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
                    Nano Banana Pro
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Section (Collapsible) */}
            <section className="rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)]">
              <button
                type="button"
                onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--base-color-brand--umber)]">
                    <SettingsIcon />
                  </span>
                  <p className="text-xs font-semibold text-[var(--base-color-brand--umber)] tracking-wider">
                    Additional
                  </p>
                </div>
                <span
                  className={`text-[var(--base-color-brand--umber)] transition-transform ${isAdditionalOpen ? 'rotate-180' : ''}`}
                >
                  <ChevronDownIcon />
                </span>
              </button>
              <div
                className={`grid overflow-hidden transition-all duration-200 ${isAdditionalOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="border-t border-[var(--base-color-brand--umber)]/20">
                    <div className="grid grid-cols-[1fr_auto] border-b border-[var(--base-color-brand--umber)]/20 px-4 py-3.5 last:border-0">
                      <p className="text-sm text-[var(--base-color-brand--umber)]">Quality</p>
                      <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
                        1K
                      </p>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] border-b border-[var(--base-color-brand--umber)]/20 px-4 py-3.5 last:border-0">
                      <p className="text-sm text-[var(--base-color-brand--umber)]">Size</p>
                      <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
                        {getDimensions()}
                      </p>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] px-4 py-3.5">
                      <p className="text-sm text-[var(--base-color-brand--umber)]">Created</p>
                      <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
                        {formatDate(image.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onRecreate(image.prompt)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] text-sm font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] transition-all hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--base-color-brand--dark-red)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              <RecreateIcon />
              Recreate
            </button>

            <button
              type="button"
              onClick={() => onDownload(image.url, image.prompt)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--base-color-brand--umber)]/60 bg-[var(--base-color-brand--shell)] text-sm font-semibold tracking-wide text-[var(--base-color-brand--bean)] transition-colors hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              <DownloadIcon />
              Download
            </button>

            <button
              type="button"
              onClick={() => onDelete(image.id)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--base-color-brand--umber)]/60 bg-[var(--base-color-brand--shell)] text-sm font-semibold tracking-wide text-[var(--base-color-brand--bean)] transition-colors hover:border-[var(--base-color-brand--dark-red)] hover:bg-[var(--base-color-brand--dark-red)] hover:text-[var(--base-color-brand--shell)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              <DeleteIcon />
              Delete
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
