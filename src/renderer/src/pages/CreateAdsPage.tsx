import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, SparkleIcon } from '@/components/icons';
import ImageDetailOverlay from '@/components/image/ImageDetailOverlay';
import type { GeneratedImage } from '@/components/image/types';
import Badge from '@/components/ui/Badge';
import {
  AD_CATEGORY_LABELS,
  AD_REFERENCES,
  getThumbnail,
  type AdReference,
} from '@/lib/adReferences';
import { useCreateAdsStore, type ResultSlot, type StepId } from '@/stores/createAdsStore';
import type { EntityData } from '@/types/electron';

// Create Ads offers a curated set of ad-relevant aspect ratios. Plain
// numeric labels ("1:1") confuse non-technical users, so each tile is
// labelled with the format's name and its typical placement.
interface AdAspectRatio {
  value: string;
  label: string;
  description: string;
  /** Visual preview dimensions in pixels — matches the ratio. */
  width: number;
  height: number;
}

const AD_ASPECT_RATIOS: AdAspectRatio[] = [
  { value: '1:1', label: 'Square', description: 'Feed posts', width: 48, height: 48 },
  { value: '4:5', label: 'Portrait', description: 'Feed ads', width: 40, height: 50 },
  { value: '9:16', label: 'Vertical', description: 'Stories & Reels', width: 30, height: 53 },
  { value: '16:9', label: 'Landscape', description: 'Link ads', width: 56, height: 32 },
];

interface StepDefinition {
  id: StepId;
  label: string;
  title: string;
  hint?: string;
}

const WIZARD_STEPS: StepDefinition[] = [
  { id: 'ad', label: 'Style', title: 'Pick an ad style' },
  { id: 'product', label: 'Product', title: 'Pick your product' },
  {
    id: 'brief',
    label: 'Brief',
    title: 'Describe your product',
    hint: "A sentence or two — what it is, who it's for, key benefits. This guides scene, props, and any text the model renders.",
  },
  { id: 'format', label: 'Format', title: 'Format and generate' },
];

export default function CreateAdsPage() {
  const [products, setProducts] = useState<EntityData[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Wizard state lives in a Zustand store so it (and any in-flight fal
  // generations) survive navigating away from and back to this page.
  const step = useCreateAdsStore((s) => s.step);
  const selectedAdId = useCreateAdsStore((s) => s.selectedAdId);
  const selectedProductId = useCreateAdsStore((s) => s.selectedProductId);
  const productBrief = useCreateAdsStore((s) => s.productBrief);
  const aspectRatio = useCreateAdsStore((s) => s.aspectRatio);
  const results = useCreateAdsStore((s) => s.results);
  const isGenerating = useCreateAdsStore((s) => s.isGenerating);
  const setStep = useCreateAdsStore((s) => s.setStep);
  const setSelectedAdId = useCreateAdsStore((s) => s.setSelectedAdId);
  const setSelectedProductId = useCreateAdsStore((s) => s.setSelectedProductId);
  const setProductBrief = useCreateAdsStore((s) => s.setProductBrief);
  const setAspectRatio = useCreateAdsStore((s) => s.setAspectRatio);
  const removeResultByImageId = useCreateAdsStore((s) => s.removeResultByImageId);
  const startNewAd = useCreateAdsStore((s) => s.startNewAd);
  const runGeneration = useCreateAdsStore((s) => s.runGeneration);
  const retrySlot = useCreateAdsStore((s) => s.retrySlot);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await window.api.entities.list('products');
        if (!cancelled) setProducts(list);
      } catch {
        if (!cancelled) toast.error("Couldn't load your products. Please try again.");
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAd: AdReference | undefined = useMemo(
    () => AD_REFERENCES.find((a) => a.id === selectedAdId),
    [selectedAdId],
  );
  const selectedProduct: EntityData | undefined = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId],
  );

  // Per-step validity — controls whether the Next button is enabled.
  const canAdvance: Record<StepId, boolean> = {
    ad: !!selectedAd,
    product: !!selectedProduct,
    brief: productBrief.trim().length > 0,
    format: !!selectedAd && !!selectedProduct && productBrief.trim().length > 0 && !isGenerating,
    results: true,
  };

  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === step);
  // Back is available on every step except the first. On the results
  // step it doubles as the Cancel action for in-flight generations.
  const canGoBack = step !== 'ad';

  const goNext = useCallback(() => {
    const idx = WIZARD_STEPS.findIndex((s) => s.id === step);
    if (idx < 0 || idx >= WIZARD_STEPS.length - 1) return;
    setStep(WIZARD_STEPS[idx + 1].id);
  }, [step, setStep]);

  const goBack = useCallback(() => {
    // On the results step, Back goes back to the format step so the user
    // can adjust and regenerate. In-flight generations are NOT stopped —
    // fal runs server-side and we've already been charged, so we let the
    // request complete and save its output to the gallery in the
    // background.
    if (step === 'results') {
      setStep('format');
      return;
    }
    const idx = WIZARD_STEPS.findIndex((s) => s.id === step);
    if (idx <= 0) return;
    setStep(WIZARD_STEPS[idx - 1].id);
  }, [step, setStep]);

  // Kick off generation via the store. The store handles all state updates,
  // so if the user navigates away mid-generation the results still stream
  // in and are visible when they return.
  const handleGenerate = useCallback(() => {
    if (!selectedAd || !selectedProduct) return;
    void runGeneration(selectedAd, selectedProduct);
  }, [selectedAd, selectedProduct, runGeneration]);

  // Download a generated ad to the user's filesystem — same mechanism the
  // Image page uses so the two flows stay consistent.
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

  // Delete a generated ad from the app gallery and drop it from the
  // results grid so the UI stays in sync.
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

  // Current step's title (the Results step isn't in WIZARD_STEPS but needs one).
  const activeStep =
    step === 'results'
      ? { id: 'results' as const, label: 'Results', title: 'Your ads' }
      : WIZARD_STEPS[currentIndex];

  return (
    <main className="flex flex-1 justify-center overflow-y-auto">
      <div className="flex min-h-full w-full max-w-5xl items-center px-6 py-8 md:px-10">
        <div className="flex w-full flex-col gap-6">
          {/* Progress indicator — kept at the narrower wizard width so it
              stays visually anchored in the centre even when the body step
              (e.g. the ad carousel) uses the full container width. */}
          <div className="mx-auto w-full max-w-3xl">
            <WizardProgress currentStep={step} />
          </div>

          {/* Step title — fixed min-height so the footer doesn't shift when
              the hint line appears only on some steps. */}
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
              the progress indicator, title, and Back/Next buttons stay in
              identical positions across the whole flow. Tall content
              (portrait result cards, long product lists) scrolls internally
              within the box. Click any result card to open the full-size
              detail overlay.

              The ad carousel and the results grid get the full container
              width so all thumbnails / all 4 generations fit on one row;
              every other step stays at the narrower wizard width. */}
          <div
            key={step}
            className={`animate-step-in hide-scrollbar h-[360px] overflow-y-auto ${
              step === 'ad' || step === 'results' ? 'w-full' : 'mx-auto w-full max-w-3xl'
            }`}
          >
            {step === 'ad' && (
              <AdStyleStep selectedAdId={selectedAdId} onSelect={setSelectedAdId} />
            )}
            {step === 'product' && (
              <ProductStep
                products={products}
                isLoading={productsLoading}
                selectedProductId={selectedProductId}
                onSelect={setSelectedProductId}
              />
            )}
            {step === 'brief' && <BriefStep value={productBrief} onChange={setProductBrief} />}
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

          {/* Footer nav — pinned to the narrow wizard width so the
              Back/Next buttons stay in the same place across every step. */}
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
                onClick={startNewAd}
                disabled={isGenerating}
                className="inline-grid h-[52px] grid-flow-col items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-6 text-sm font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_4px_0_0_var(--base-color-brand--dark-red)] transition-all duration-150 hover:bg-[var(--base-color-brand--red)] focus:outline-none active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] disabled:cursor-not-allowed disabled:bg-[var(--base-color-brand--umber)] disabled:text-[var(--base-color-brand--shell)]/70 disabled:shadow-[0_4px_0_0_var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                Create another
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

      {/* Full-screen detail overlay for previewing, downloading, or deleting
          a generated ad — same component the Image page uses. */}
      {selectedImage && (
        <ImageDetailOverlay
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDownload={handleDownload}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedImage(null);
          }}
          // Recreate isn't meaningful here — the user is already inside the
          // ad wizard with their inputs. Provide a no-op so the shared panel
          // component's button stays wired without sending them elsewhere.
          onRecreate={() => {}}
        />
      )}
    </main>
  );
}

// --- Progress indicator ---------------------------------------------------

function WizardProgress({ currentStep }: { currentStep: StepId }) {
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

// --- Step: Ad style -------------------------------------------------------

function AdStyleStep({
  selectedAdId,
  onSelect,
}: {
  selectedAdId: string | null;
  onSelect: (id: string) => void;
}) {
  // Soft fade on the left/right edges so cards appear to dissolve off-screen
  // instead of getting clipped abruptly at the carousel boundary.
  const fadeMask =
    'linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)';

  const scrollerRef = useRef<HTMLDivElement>(null);

  // Scroll by roughly one card-and-a-bit per click so multiple presses walk
  // cleanly through the carousel.
  const scrollBy = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 320, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex items-center gap-3">
      <CarouselScrollButton direction="left" onClick={() => scrollBy(-1)} />
      <div
        ref={scrollerRef}
        className="hide-scrollbar min-w-0 flex-1 overflow-x-auto"
        style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
      >
        <div className="flex gap-4 pb-2">
          {AD_REFERENCES.map((ad) => {
            const active = selectedAdId === ad.id;
            const categoryLabel = AD_CATEGORY_LABELS[ad.category];
            return (
              <button
                key={ad.id}
                type="button"
                onClick={() => onSelect(ad.id)}
                title={categoryLabel}
                className={`group relative h-64 shrink-0 overflow-hidden rounded-2xl border-2 bg-[var(--base-color-brand--shell)] transition-all sm:h-72 ${
                  active
                    ? 'border-[var(--base-color-brand--bean)] shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)]'
                    : 'border-transparent hover:border-[var(--base-color-brand--umber)]/40'
                }`}
              >
                <img
                  src={getThumbnail(ad)}
                  alt={categoryLabel}
                  className="block h-full w-auto transition-transform group-hover:scale-[1.03]"
                />
                <div className="absolute top-2 left-2 z-20">
                  <Badge>{categoryLabel}</Badge>
                </div>
                {active && (
                  <div className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]">
                    <CheckIcon />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <CarouselScrollButton direction="right" onClick={() => scrollBy(1)} />
    </div>
  );
}

function CarouselScrollButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)] shadow-[0_4px_12px_-4px_rgba(51,32,26,0.35)] transition-colors hover:border-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
    >
      {direction === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  );
}

// --- Step: Product --------------------------------------------------------

function ProductStep({
  products,
  isLoading,
  selectedProductId,
  onSelect,
}: {
  products: EntityData[];
  isLoading: boolean;
  selectedProductId: string | null;
  onSelect: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-8 text-sm text-[var(--base-color-brand--umber)]">
        <div className="size-4 animate-spin rounded-full border-2 border-[var(--base-color-brand--umber)]/30 border-t-[var(--base-color-brand--bean)]" />
        Loading products...
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--champagne)] p-8 text-center">
        <p className="text-sm text-[var(--base-color-brand--umber)]">
          No products yet. Add a product on the Products page to get started.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {products.map((product) => {
        const active = selectedProductId === product.id;
        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect(product.id)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-[var(--base-color-brand--champagne)] text-left transition-all ${
              active
                ? 'border-[var(--base-color-brand--bean)] shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)]'
                : 'border-transparent hover:border-[var(--base-color-brand--umber)]/40'
            }`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[var(--base-color-brand--shell)]">
              {product.thumbnailUrl ? (
                <img
                  src={product.thumbnailUrl}
                  alt={product.name}
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
                title={product.name}
              >
                {product.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// --- Step: Brief ----------------------------------------------------------

function BriefStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. A double-walled stainless steel coffee mug that keeps drinks hot for 6 hours. Leak-proof lid, minimalist design, aimed at remote workers."
      autoFocus
      className="min-h-[180px] w-full resize-y rounded-2xl border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--champagne)] p-4 text-[15px] text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
    />
  );
}

// --- Step: Format ---------------------------------------------------------

function FormatStep({
  aspectRatio,
  onAspectRatioChange,
}: {
  aspectRatio: string;
  onAspectRatioChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {AD_ASPECT_RATIOS.map((ratio) => {
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
            {/* Proportional shape preview */}
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
  results: ResultSlot[];
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
  // All 4 generations side-by-side on one row so the user can compare them
  // at a glance. Uses the same wider container width as the ad carousel.
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
  slot: ResultSlot;
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

  // Error state — shows the failure reason and a "Try again" button that
  // re-runs just this one slot without touching the successful ones.
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

  // Pending skeleton — plain div, nothing to click.
  if (slot.status === 'pending') {
    return (
      <div className={cardClass} style={aspectStyle}>
        <div className="skeleton-loader size-full" />
      </div>
    );
  }

  // Success — click to open the full-size detail overlay.
  const image = slot.image!;
  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      className={`group cursor-zoom-in transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)] ${cardClass}`}
      style={aspectStyle}
      aria-label="Open generated ad"
    >
      <img
        src={image.url}
        alt="Generated ad"
        className="size-full object-cover transition-transform group-hover:scale-[1.03]"
      />
    </button>
  );
}
