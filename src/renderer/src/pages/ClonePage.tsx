import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { CheckIcon, CloseIcon, ImageAddIcon, SparkleIcon } from '@/components/icons';
import ImageDetailOverlay from '@/components/image/ImageDetailOverlay';
import type { GeneratedImage } from '@/components/image/types';
import { useCloneStore, type CloneResultSlot, type CloneStepId } from '@/stores/cloneStore';
import {
  MAX_IMAGE_SIZE_MB,
  SUPPORTED_IMAGE_ACCEPT,
  SUPPORTED_IMAGE_MIME_REGEX,
} from '@/lib/constants/image-form';
import type { EntityData } from '@/types/electron';

interface StepDefinition {
  id: CloneStepId;
  label: string;
  title: string;
  hint?: string;
}

const WIZARD_STEPS: StepDefinition[] = [
  { id: 'source', label: 'Source', title: 'Upload an image to clone' },
  { id: 'character', label: 'Character', title: 'Pick a character' },
  {
    id: 'tweaks',
    label: 'Tweaks',
    title: 'Any changes?',
    hint: 'Optional. Only small adjustments — for example: change the dress from black to red, or swap the background from nude to white. Leave blank to clone the scene exactly.',
  },
  { id: 'format', label: 'Format', title: 'Format and generate' },
];

// Aspect ratio tiles mirror the Create Ads page so the app feels
// consistent. Labelled by placement, not cryptic ratio.
interface CloneAspectRatio {
  value: string;
  label: string;
  description: string;
  width: number;
  height: number;
}

// Descriptions are intentionally neutral — the Clone flow isn't only used
// for ads, so we avoid placement names like "Feed" or "Link ads" here.
const ASPECT_RATIOS: CloneAspectRatio[] = [
  { value: '1:1', label: 'Square', description: '1:1', width: 48, height: 48 },
  { value: '4:5', label: 'Portrait', description: '4:5', width: 40, height: 50 },
  { value: '9:16', label: 'Vertical', description: '9:16', width: 30, height: 53 },
  { value: '16:9', label: 'Landscape', description: '16:9', width: 56, height: 32 },
];

/** Pick the aspect ratio tile closest to a source image's natural dimensions. */
function closestAspectRatio(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const sourceRatio = width / height;
  let best = ASPECT_RATIOS[0];
  let bestDiff = Infinity;
  for (const r of ASPECT_RATIOS) {
    const [rw, rh] = r.value.split(':').map(Number);
    const diff = Math.abs(sourceRatio - rw / rh);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = r;
    }
  }
  return best.value;
}

export default function ClonePage() {
  const [characters, setCharacters] = useState<EntityData[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const step = useCloneStore((s) => s.step);
  const sourceImage = useCloneStore((s) => s.sourceImage);
  const selectedCharacterId = useCloneStore((s) => s.selectedCharacterId);
  const tweaks = useCloneStore((s) => s.tweaks);
  const aspectRatio = useCloneStore((s) => s.aspectRatio);
  const results = useCloneStore((s) => s.results);
  const isGenerating = useCloneStore((s) => s.isGenerating);
  const setStep = useCloneStore((s) => s.setStep);
  const setSourceImage = useCloneStore((s) => s.setSourceImage);
  const setSelectedCharacterId = useCloneStore((s) => s.setSelectedCharacterId);
  const setTweaks = useCloneStore((s) => s.setTweaks);
  const setAspectRatio = useCloneStore((s) => s.setAspectRatio);
  const removeResultByImageId = useCloneStore((s) => s.removeResultByImageId);
  const startNewClone = useCloneStore((s) => s.startNewClone);
  const runGeneration = useCloneStore((s) => s.runGeneration);
  const retrySlot = useCloneStore((s) => s.retrySlot);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await window.api.entities.list('characters');
        if (!cancelled) setCharacters(list);
      } catch {
        if (!cancelled) toast.error("Couldn't load your characters. Please try again.");
      } finally {
        if (!cancelled) setCharactersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCharacter: EntityData | undefined = useMemo(
    () => characters.find((c) => c.id === selectedCharacterId),
    [characters, selectedCharacterId],
  );

  const canAdvance: Record<CloneStepId, boolean> = {
    source: !!sourceImage,
    character: !!selectedCharacter,
    tweaks: true, // tweaks are optional
    format: !!sourceImage && !!selectedCharacter && !isGenerating,
    results: true,
  };

  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === step);
  const canGoBack = step !== 'source';

  const goNext = useCallback(() => {
    const idx = WIZARD_STEPS.findIndex((s) => s.id === step);
    if (idx < 0 || idx >= WIZARD_STEPS.length - 1) return;
    setStep(WIZARD_STEPS[idx + 1].id);
  }, [step, setStep]);

  const goBack = useCallback(() => {
    // On the results step, Back goes back to format so the user can
    // adjust and regenerate. In-flight fal requests are NOT stopped —
    // we can't actually cancel them server-side, so they're allowed to
    // finish and save their outputs to the gallery in the background.
    if (step === 'results') {
      setStep('format');
      return;
    }
    const idx = WIZARD_STEPS.findIndex((s) => s.id === step);
    if (idx <= 0) return;
    setStep(WIZARD_STEPS[idx - 1].id);
  }, [step, setStep]);

  const handleGenerate = useCallback(() => {
    if (!selectedCharacter) return;
    void runGeneration(selectedCharacter);
  }, [selectedCharacter, runGeneration]);

  const handleDownload = useCallback(async (url: string, prompt: string) => {
    const filename = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    try {
      const result = await window.api.files.download(url, filename);
      if (result.success) {
        toast.success('Image saved.');
      } else if (!result.cancelled) {
        toast.error("Couldn't save the image. Please try again.");
      }
    } catch {
      toast.error("Couldn't save the image. Please try again.");
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const result = await window.api.images.delete(id);
        if (result.success) {
          removeResultByImageId(id);
          toast.success('Image deleted.');
        } else {
          toast.error("Couldn't delete the image. Please try again.");
        }
      } catch {
        toast.error("Couldn't delete the image. Please try again.");
      }
    },
    [removeResultByImageId],
  );

  const activeStep =
    step === 'results'
      ? { id: 'results' as const, label: 'Results', title: 'Your clones' }
      : WIZARD_STEPS[currentIndex];

  return (
    <main className="flex flex-1 justify-center overflow-y-auto">
      <div className="flex min-h-full w-full max-w-5xl items-center px-6 py-8 md:px-10">
        <div className="flex w-full flex-col gap-6">
          <div className="mx-auto w-full max-w-3xl">
            <WizardProgress currentStep={step} />
          </div>

          {/* Fixed min-height reserves enough vertical space for the
              longest step hint (the Tweaks step), so the step body and
              footer buttons stay in the same position across every step. */}
          <div className="mx-auto flex min-h-[112px] w-full max-w-3xl flex-col gap-2 text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[var(--base-color-brand--bean)] sm:text-4xl"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {activeStep.title}
            </h2>
            {activeStep.id !== 'results' &&
              WIZARD_STEPS.find((s) => s.id === activeStep.id)?.hint && (
                <p className="mx-auto max-w-xl text-sm text-[var(--base-color-brand--umber)]">
                  {WIZARD_STEPS.find((s) => s.id === activeStep.id)?.hint}
                </p>
              )}
          </div>

          {/* Step body — fixed 360px on every step (including results) so
              progress indicator, title, and Back/Next buttons sit in
              identical positions across the whole flow. Tall content
              scrolls inside the box; click any result card to open the
              full-size detail overlay. The results grid uses the full
              container width so four 9:16 cards fit on one row. */}
          <div
            key={step}
            className={`animate-step-in hide-scrollbar h-[360px] overflow-y-auto ${
              step === 'results' ? 'w-full' : 'mx-auto w-full max-w-3xl'
            }`}
          >
            {step === 'source' && (
              <SourceStep
                source={sourceImage}
                onPick={(img) => {
                  setSourceImage(img);
                  // Preselect the aspect ratio closest to the source's
                  // natural shape — user can override on the format step.
                  if (img) setAspectRatio(closestAspectRatio(img.width, img.height));
                }}
              />
            )}
            {step === 'character' && (
              <CharacterStep
                characters={characters}
                isLoading={charactersLoading}
                selectedCharacterId={selectedCharacterId}
                onSelect={setSelectedCharacterId}
              />
            )}
            {step === 'tweaks' && <TweaksStep value={tweaks} onChange={setTweaks} />}
            {step === 'format' && (
              <FormatStep aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio} />
            )}
            {step === 'results' && (
              <ResultsStep
                results={results}
                aspectRatio={aspectRatio}
                onOpen={setSelectedImage}
                onRetry={retrySlot}
              />
            )}
          </div>

          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={!canGoBack}
              className="rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-5 py-2.5 text-xs font-semibold tracking-wide text-[var(--base-color-brand--bean)] transition-colors hover:border-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)] disabled:cursor-not-allowed disabled:opacity-0"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              Back
            </button>

            {step === 'results' ? (
              <button
                type="button"
                onClick={startNewClone}
                disabled={isGenerating}
                className="inline-grid h-[52px] grid-flow-col items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-6 text-sm font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_4px_0_0_var(--base-color-brand--dark-red)] transition-all duration-150 hover:bg-[var(--base-color-brand--red)] focus:outline-none active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] disabled:cursor-not-allowed disabled:bg-[var(--base-color-brand--umber)] disabled:text-[var(--base-color-brand--shell)]/70 disabled:shadow-[0_4px_0_0_var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                Clone another
              </button>
            ) : step === 'format' ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canAdvance.format}
                className="inline-grid h-[52px] grid-flow-col items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-6 text-sm font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_4px_0_0_var(--base-color-brand--dark-red)] transition-all duration-150 hover:bg-[var(--base-color-brand--red)] focus:outline-none active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] disabled:cursor-not-allowed disabled:bg-[var(--base-color-brand--umber)] disabled:text-[var(--base-color-brand--shell)]/70 disabled:shadow-[0_4px_0_0_var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                <span>Generate</span>
                <SparkleIcon />
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance[step]}
                className="inline-grid h-[52px] grid-flow-col items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-6 text-sm font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_4px_0_0_var(--base-color-brand--dark-red)] transition-all duration-150 hover:bg-[var(--base-color-brand--red)] focus:outline-none active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] disabled:cursor-not-allowed disabled:bg-[var(--base-color-brand--umber)] disabled:text-[var(--base-color-brand--shell)]/70 disabled:shadow-[0_4px_0_0_var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageDetailOverlay
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDownload={handleDownload}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedImage(null);
          }}
          onRecreate={() => {}}
        />
      )}
    </main>
  );
}

// --- Progress indicator ---------------------------------------------------

function WizardProgress({ currentStep }: { currentStep: CloneStepId }) {
  const currentIdx =
    currentStep === 'results'
      ? WIZARD_STEPS.length
      : WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {WIZARD_STEPS.map((s, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold transition-colors ${
                done || active
                  ? 'bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]'
                  : 'border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--umber)]'
              }`}
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {done ? <CheckIcon /> : idx + 1}
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 rounded-full transition-colors ${
                  idx < currentIdx
                    ? 'bg-[var(--base-color-brand--bean)]'
                    : 'bg-[var(--base-color-brand--umber)]/30'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Step: Source image upload -------------------------------------------

function SourceStep({
  source,
  onPick,
}: {
  source: ReturnType<typeof useCloneStore.getState>['sourceImage'];
  onPick: (source: ReturnType<typeof useCloneStore.getState>['sourceImage']) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!SUPPORTED_IMAGE_MIME_REGEX.test(file.type)) {
        toast.error('Use a JPEG, PNG, WebP, or HEIC image.');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast.error(`Image is too large. Max size is ${MAX_IMAGE_SIZE_MB}MB.`);
        return;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
        reader.readAsDataURL(file);
      });

      const dims = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = dataUrl;
      });

      onPick({ dataUrl, name: file.name, width: dims.width, height: dims.height });
    },
    [onPick],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      void handleFile(files[0]);
    },
    [handleFile],
  );

  if (source) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative inline-block max-h-[340px] overflow-hidden rounded-2xl border-2 border-[var(--base-color-brand--bean)] bg-[var(--base-color-brand--shell)] shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)]">
          <img
            src={source.dataUrl}
            alt={source.name}
            className="block max-h-[340px] w-auto object-contain"
          />
          <button
            type="button"
            onClick={() => onPick(null)}
            aria-label="Remove image"
            className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)] transition-colors hover:border-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex h-64 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-[var(--base-color-brand--champagne)] p-6 text-center transition-colors ${
          isDragging
            ? 'border-[var(--base-color-brand--bean)] bg-[var(--base-color-brand--shell)]'
            : 'border-[var(--base-color-brand--umber)]/50 hover:border-[var(--base-color-brand--bean)]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_IMAGE_ACCEPT}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)]">
          <ImageAddIcon className="size-6" />
        </div>
        <p
          className="text-base font-bold tracking-tight text-[var(--base-color-brand--bean)]"
          style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
        >
          Drop a reference image here
        </p>
        <p className="text-xs text-[var(--base-color-brand--umber)]">
          or click to browse · JPEG, PNG, WebP, HEIC · up to {MAX_IMAGE_SIZE_MB}MB
        </p>
      </label>
    </div>
  );
}

// --- Step: Character picker ----------------------------------------------

function CharacterStep({
  characters,
  isLoading,
  selectedCharacterId,
  onSelect,
}: {
  characters: EntityData[];
  isLoading: boolean;
  selectedCharacterId: string | null;
  onSelect: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-8 text-sm text-[var(--base-color-brand--umber)]">
        <div className="size-4 animate-spin rounded-full border-2 border-[var(--base-color-brand--umber)]/30 border-t-[var(--base-color-brand--bean)]" />
        Loading characters...
      </div>
    );
  }
  if (characters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--champagne)] p-8 text-center">
        <p className="text-sm text-[var(--base-color-brand--umber)]">
          No characters yet. Add one on the Characters page to get started.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {characters.map((character) => {
        const active = selectedCharacterId === character.id;
        return (
          <button
            key={character.id}
            type="button"
            onClick={() => onSelect(character.id)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-[var(--base-color-brand--champagne)] text-left transition-all ${
              active
                ? 'border-[var(--base-color-brand--bean)] shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)]'
                : 'border-transparent hover:border-[var(--base-color-brand--umber)]/40'
            }`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[var(--base-color-brand--shell)]">
              {character.thumbnailUrl ? (
                <img
                  src={character.thumbnailUrl}
                  alt={character.name}
                  className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                />
              ) : (
                <div className="grid size-full place-items-center text-xs text-[var(--base-color-brand--umber)]">
                  No image
                </div>
              )}
              {active && (
                <div className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]">
                  <CheckIcon />
                </div>
              )}
            </div>
            <div className="p-3">
              <span
                className="block truncate text-sm font-bold tracking-tight text-[var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
                title={character.name}
              >
                {character.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// --- Step: Tweaks --------------------------------------------------------

function TweaksStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. Change the dress from black to red. Swap the background from nude to white. Keep everything else identical."
      autoFocus
      className="min-h-[180px] w-full resize-y rounded-2xl border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--champagne)] p-4 text-[15px] text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
    />
  );
}

// --- Step: Format --------------------------------------------------------

function FormatStep({
  aspectRatio,
  onAspectRatioChange,
}: {
  aspectRatio: string;
  onAspectRatioChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ASPECT_RATIOS.map((ratio) => {
        const active = aspectRatio === ratio.value;
        return (
          <button
            key={ratio.value}
            type="button"
            onClick={() => onAspectRatioChange(ratio.value)}
            className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 bg-[var(--base-color-brand--champagne)] p-4 transition-all ${
              active
                ? 'border-[var(--base-color-brand--bean)] shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)]'
                : 'border-transparent hover:border-[var(--base-color-brand--umber)]/40'
            }`}
          >
            <div className="grid h-[60px] w-full place-items-center">
              <div
                className={`rounded-md border-2 transition-colors ${
                  active
                    ? 'border-[var(--base-color-brand--bean)] bg-[var(--base-color-brand--bean)]/10'
                    : 'border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)]'
                }`}
                style={{ width: ratio.width, height: ratio.height }}
              />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-sm font-bold tracking-tight text-[var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                {ratio.label}
              </span>
              <span className="text-[11px] text-[var(--base-color-brand--umber)]">
                {ratio.description}
              </span>
            </div>
            {active && (
              <div className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]">
                <CheckIcon />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// --- Step: Results --------------------------------------------------------

function ResultsStep({
  results,
  aspectRatio,
  onOpen,
  onRetry,
}: {
  results: CloneResultSlot[];
  aspectRatio: string;
  onOpen: (image: GeneratedImage) => void;
  onRetry: (slotId: string) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-[var(--base-color-brand--umber)]">
        No results yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-4">
      {results.map((slot) => (
        <ResultCard
          key={slot.id}
          slot={slot}
          aspectRatio={aspectRatio}
          onOpen={onOpen}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

function ResultCard({
  slot,
  aspectRatio,
  onOpen,
  onRetry,
}: {
  slot: CloneResultSlot;
  aspectRatio: string;
  onOpen: (image: GeneratedImage) => void;
  onRetry: (slotId: string) => void;
}) {
  const [w, h] = aspectRatio.split(':').map(Number);
  const aspectStyle =
    Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0
      ? { aspectRatio: `${w} / ${h}` }
      : { aspectRatio: '1 / 1' };

  const cardClass =
    'relative w-full overflow-hidden rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)]';

  if (slot.status === 'error') {
    return (
      <div className={cardClass} style={aspectStyle}>
        <div className="flex size-full flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-xs leading-snug text-[var(--base-color-brand--umber)]">
            {slot.error ?? "Couldn't generate this one."}
          </p>
          <button
            type="button"
            onClick={() => onRetry(slot.id)}
            className="rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--base-color-brand--bean)] transition-colors hover:border-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (slot.status === 'pending') {
    return (
      <div className={cardClass} style={aspectStyle}>
        <div className="skeleton-loader size-full" />
      </div>
    );
  }

  const image = slot.image!;
  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      className={`group cursor-zoom-in transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)] ${cardClass}`}
      style={aspectStyle}
      aria-label="Open generated clone"
    >
      <img
        src={image.url}
        alt="Generated clone"
        className="size-full object-cover transition-transform group-hover:scale-[1.03]"
        onError={(e) => {
          // If the saved file has gone missing (deleted out-of-band, save
          // race, etc.), show a fallback placeholder instead of a broken
          // image icon.
          const img = e.currentTarget;
          img.style.display = 'none';
          const parent = img.parentElement;
          if (parent && !parent.querySelector('.missing-image-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className =
              'missing-image-placeholder grid size-full place-items-center p-4 text-center text-xs text-[var(--base-color-brand--umber)]';
            placeholder.textContent = 'This image is no longer available.';
            parent.appendChild(placeholder);
          }
        }}
      />
    </button>
  );
}
