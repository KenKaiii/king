import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { CheckIcon, CloseIcon, SparkleIcon, UploadIcon, ImageAddIcon } from '@/components/icons';
import SelectDropdown from '@/components/ui/SelectDropdown';
import { useFacebookAccountStore } from '@/stores/facebookAccountStore';
import type {
  FbAdAccount,
  FbPage,
  FbCampaign,
  FbAdSet,
  FbObjective,
  FbCtaType,
  FbCreateAdResult,
} from '@/types/electron';
import { cleanIpcError } from '@/lib/ipcError';

const MAX_BYTES = 15 * 1024 * 1024;

const STEPS = [
  { id: 'account', title: 'Account & Page' },
  { id: 'campaign', title: 'Campaign' },
  { id: 'adset', title: 'Ad set' },
  { id: 'creative', title: 'Creative' },
  { id: 'review', title: 'Review' },
  { id: 'result', title: 'Done' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// OUTCOME_SALES / OUTCOME_LEADS / OUTCOME_APP_PROMOTION require
// `promoted_object` (Pixel + custom event, page id, app id) on the ad set,
// which we don't yet collect in the wizard. Restricted to objectives that
// work without `promoted_object` until that's wired — see plan phase 5.4.
const OBJECTIVE_OPTIONS: { value: FbObjective; label: string }[] = [
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
  { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
];

const CTA_OPTIONS: { value: FbCtaType; label: string }[] = [
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'GET_OFFER', label: 'Get Offer' },
];

interface NewFacebookAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (result: FbCreateAdResult) => void;
}

interface CreativeImage {
  filename: string;
  bytes: ArrayBuffer;
  previewUrl: string;
}

export default function NewFacebookAdModal({
  isOpen,
  onClose,
  onCreated,
}: NewFacebookAdModalProps) {
  const storeAdAccountId = useFacebookAccountStore((s) => s.selectedAdAccountId);
  const storePageId = useFacebookAccountStore((s) => s.selectedPageId);

  const [step, setStep] = useState<StepId>('account');

  // Step 1.
  const [adAccounts, setAdAccounts] = useState<FbAdAccount[]>([]);
  const [pages, setPages] = useState<FbPage[]>([]);
  const [adAccountId, setAdAccountId] = useState<string>('');
  const [pageId, setPageId] = useState<string>('');
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Step 2.
  const [campaigns, setCampaigns] = useState<FbCampaign[]>([]);
  const [campaignChoice, setCampaignChoice] = useState<string>('__new');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignObjective, setNewCampaignObjective] = useState<FbObjective>('OUTCOME_TRAFFIC');

  // Step 3.
  const [adSets, setAdSets] = useState<FbAdSet[]>([]);
  const [adSetChoice, setAdSetChoice] = useState<string>('__new');
  const [newAdSetName, setNewAdSetName] = useState('');
  const [dailyBudget, setDailyBudget] = useState<number>(20);
  const [countries, setCountries] = useState<string>('US');
  const [ageMin, setAgeMin] = useState<number>(18);
  const [ageMax, setAgeMax] = useState<number>(65);

  // Step 4.
  const [image, setImage] = useState<CreativeImage | null>(null);
  const [headline, setHeadline] = useState('');
  const [primaryText, setPrimaryText] = useState('');
  const [link, setLink] = useState('');
  const [ctaType, setCtaType] = useState<FbCtaType>('SHOP_NOW');

  // Step 5.
  const [adName, setAdName] = useState('');
  const [launchActive, setLaunchActive] = useState(false);

  // Step 6.
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FbCreateAdResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentAccount = useMemo(
    () => adAccounts.find((a) => a.id === adAccountId),
    [adAccounts, adAccountId],
  );

  // Load ad accounts + pages when the modal opens. Prefill from store.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setAccountsLoading(true);
    void (async () => {
      try {
        const [accs, pgs] = await Promise.all([
          window.api.facebookAds.listAdAccounts(),
          window.api.facebookAds.listPages(),
        ]);
        if (cancelled) return;
        setAdAccounts(accs);
        setPages(pgs);
        const initialAccount =
          (storeAdAccountId && accs.find((a) => a.id === storeAdAccountId)?.id) ||
          accs[0]?.id ||
          '';
        const initialPage =
          (storePageId && pgs.find((p) => p.id === storePageId)?.id) || pgs[0]?.id || '';
        setAdAccountId(initialAccount);
        setPageId(initialPage);
      } catch (err) {
        const msg = cleanIpcError(err, 'Failed to load Facebook accounts');
        toast.error(msg);
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, storeAdAccountId, storePageId]);

  // Reload campaigns when ad account changes.
  useEffect(() => {
    if (!isOpen || !adAccountId) return;
    let cancelled = false;
    void (async () => {
      try {
        const list = await window.api.facebookAds.listCampaigns(adAccountId);
        if (!cancelled) {
          setCampaigns(list);
          setCampaignChoice('__new');
          setAdSets([]);
          setAdSetChoice('__new');
        }
      } catch {
        if (!cancelled) setCampaigns([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, adAccountId]);

  // Reload ad sets when campaign selection changes.
  useEffect(() => {
    if (!isOpen || !adAccountId) return;
    if (campaignChoice === '__new') {
      setAdSets([]);
      setAdSetChoice('__new');
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const list = await window.api.facebookAds.listAdSets(adAccountId, campaignChoice);
        if (!cancelled) {
          setAdSets(list);
          setAdSetChoice('__new');
        }
      } catch {
        if (!cancelled) setAdSets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, adAccountId, campaignChoice]);

  // ESC to close.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset state on close so reopening starts fresh.
  useEffect(() => {
    if (isOpen) return;
    setStep('account');
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setResult(null);
    setErrorMessage(null);
    setSubmitting(false);
  }, [isOpen]);

  const handleImagePick = useCallback(async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error(`Image too large — max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`);
      return;
    }
    const bytes = await file.arrayBuffer();
    const previewUrl = URL.createObjectURL(file);
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { filename: file.name, bytes, previewUrl };
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) void handleImagePick(file);
    },
    [handleImagePick],
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleImagePick(file);
      e.target.value = '';
    },
    [handleImagePick],
  );

  // Step gating.
  const canAdvance: Record<StepId, boolean> = {
    account: !!adAccountId && !!pageId,
    campaign:
      campaignChoice !== '__new' || (newCampaignName.trim().length > 0 && !!newCampaignObjective),
    adset:
      adSetChoice !== '__new' ||
      (newAdSetName.trim().length > 0 && dailyBudget > 0 && countries.trim().length > 0),
    creative:
      !!image &&
      headline.trim().length > 0 &&
      primaryText.trim().length > 0 &&
      /^https?:\/\//.test(link.trim()),
    review: adName.trim().length > 0 && !submitting,
    result: true,
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const isWizardStep = step !== 'result';

  const goNext = () => {
    if (!canAdvance[step]) return;
    const next = STEPS[Math.min(STEPS.length - 1, stepIndex + 1)];
    if (next) setStep(next.id);
  };
  const goBack = () => {
    const prev = STEPS[Math.max(0, stepIndex - 1)];
    if (prev) setStep(prev.id);
  };

  const submit = async () => {
    if (!image) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const ctryArr = countries
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      const r = await window.api.facebookAds.createAd({
        adAccountId,
        pageId,
        ...(campaignChoice === '__new'
          ? {
              newCampaign: {
                name: newCampaignName.trim(),
                objective: newCampaignObjective,
              },
            }
          : { campaignId: campaignChoice }),
        ...(adSetChoice === '__new'
          ? {
              newAdSet: {
                name: newAdSetName.trim(),
                dailyBudget,
                countries: ctryArr,
                ageMin,
                ageMax,
              },
            }
          : { adSetId: adSetChoice }),
        ad: {
          name: adName.trim(),
          headline: headline.trim(),
          message: primaryText.trim(),
          link: link.trim(),
          ctaType,
          status: launchActive ? 'ACTIVE' : 'PAUSED',
        },
        image: { filename: image.filename, bytes: image.bytes },
      });
      setResult(r);
      setStep('result');
      onCreated?.(r);
    } catch (err) {
      setErrorMessage(cleanIpcError(err, 'Failed to create ad'));
      setStep('result');
    } finally {
      setSubmitting(false);
    }
  };

  const accountOptions = useMemo(
    () =>
      adAccounts.map((a) => ({
        value: a.id,
        label: `${a.name} (${a.id}) · ${a.currency}${a.business ? ` — ${a.business.name}` : ''}`,
      })),
    [adAccounts],
  );
  const pageOptions = useMemo(
    () => pages.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` })),
    [pages],
  );
  const campaignOptions = useMemo(
    () => [
      { value: '__new', label: '+ Create new campaign…' },
      ...campaigns.map((c) => ({ value: c.id, label: `${c.name} · ${c.objective}` })),
    ],
    [campaigns],
  );
  const adSetOptions = useMemo(
    () => [
      { value: '__new', label: '+ Create new ad set…' },
      ...adSets.map((s) => ({ value: s.id, label: s.name })),
    ],
    [adSets],
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ willChange: 'opacity' }}
    >
      <div
        className={`absolute inset-0 bg-[var(--base-color-brand--bean)]/60 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-2xl rounded-3xl border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] p-6 shadow-2xl transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3
              className="text-lg font-semibold text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              New Facebook Ad
            </h3>
            <p className="mt-0.5 text-xs text-[var(--base-color-brand--umber)]">
              {STEPS[stepIndex]?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] p-1.5 text-[var(--base-color-brand--bean)] transition-colors hover:bg-[var(--base-color-brand--champagne)]"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Progress */}
        {isWizardStep && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {STEPS.slice(0, -1).map((s, idx) => {
              const done = idx < stepIndex;
              const active = idx === stepIndex;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold transition-colors ${
                      done || active
                        ? 'bg-[var(--base-color-brand--bean)] text-[var(--base-color-brand--shell)]'
                        : 'border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--umber)]'
                    }`}
                  >
                    {done ? <CheckIcon /> : idx + 1}
                  </div>
                  {idx < STEPS.length - 2 && (
                    <div
                      className={`h-0.5 w-6 rounded-full transition-colors ${
                        idx < stepIndex
                          ? 'bg-[var(--base-color-brand--bean)]'
                          : 'bg-[var(--base-color-brand--umber)]/30'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body — fixed height for layout consistency. */}
        <div
          key={step}
          className="animate-step-in hide-scrollbar mt-5 h-[340px] overflow-y-auto pr-1"
        >
          {step === 'account' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[var(--base-color-brand--umber)]">
                Choose which ad account and Facebook Page this ad runs from.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Ad account
                </label>
                <SelectDropdown
                  options={accountOptions}
                  value={adAccountId}
                  onChange={setAdAccountId}
                  fullWidth
                  placeholder={accountsLoading ? 'Loading…' : 'Select account'}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Page
                </label>
                <SelectDropdown
                  options={pageOptions}
                  value={pageId}
                  onChange={setPageId}
                  fullWidth
                  placeholder="Select page"
                />
              </div>
            </div>
          )}

          {step === 'campaign' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Campaign
                </label>
                <SelectDropdown
                  options={campaignOptions}
                  value={campaignChoice}
                  onChange={setCampaignChoice}
                  fullWidth
                />
              </div>
              {campaignChoice === '__new' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                      Campaign name
                    </label>
                    <input
                      type="text"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="Spring promo 2026"
                      className="w-full rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm text-[var(--text-color--text-primary)] focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                      Objective
                    </label>
                    <SelectDropdown
                      options={OBJECTIVE_OPTIONS}
                      value={newCampaignObjective}
                      onChange={(v) => setNewCampaignObjective(v as FbObjective)}
                      fullWidth
                    />
                  </div>
                  <p className="text-[10px] text-[var(--base-color-brand--umber)]/80">
                    Don&apos;t use this for housing, jobs, credit, or political ads — those need
                    extra disclosures.
                  </p>
                </>
              )}
            </div>
          )}

          {step === 'adset' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Ad set
                </label>
                <SelectDropdown
                  options={adSetOptions}
                  value={adSetChoice}
                  onChange={setAdSetChoice}
                  fullWidth
                />
              </div>
              {adSetChoice === '__new' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                      Ad set name
                    </label>
                    <input
                      type="text"
                      value={newAdSetName}
                      onChange={(e) => setNewAdSetName(e.target.value)}
                      placeholder="US 18–65"
                      className="w-full rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                      Daily budget ({currentAccount?.currency ?? 'USD'})
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                        Countries (use two-letter codes, e.g. US, GB)
                      </label>
                      <input
                        type="text"
                        value={countries}
                        onChange={(e) => setCountries(e.target.value)}
                        placeholder="US, CA, GB"
                        className="w-full rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                        Age range
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={13}
                          max={65}
                          value={ageMin}
                          onChange={(e) =>
                            setAgeMin(Math.min(65, Math.max(13, Number(e.target.value))))
                          }
                          className="w-20 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-3 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                        />
                        <span className="text-xs text-[var(--base-color-brand--umber)]">to</span>
                        <input
                          type="number"
                          min={13}
                          max={65}
                          value={ageMax}
                          onChange={(e) =>
                            setAgeMax(Math.min(65, Math.max(13, Number(e.target.value))))
                          }
                          className="w-20 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-3 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'creative' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Image (max 15 MB)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="relative flex h-32 items-center justify-center rounded-2xl border border-dashed border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--champagne)]/50 px-4"
                >
                  {image ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={image.previewUrl}
                        alt="preview"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[var(--base-color-brand--bean)]">
                          {image.filename}
                        </p>
                        <p className="text-[10px] text-[var(--base-color-brand--umber)]">
                          {(image.bytes.byteLength / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[var(--base-color-brand--umber)]">
                      <ImageAddIcon />
                      <span className="text-xs">Drag & drop, or</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onFileInput}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Limited offer"
                    className="w-full rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                    Call to action
                  </label>
                  <SelectDropdown
                    options={CTA_OPTIONS}
                    value={ctaType}
                    onChange={(v) => setCtaType(v as FbCtaType)}
                    fullWidth
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Primary text
                </label>
                <textarea
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  rows={2}
                  placeholder="Tell your audience what they're getting…"
                  className="w-full resize-none rounded-2xl border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://yourshop.com/product"
                  className="w-full rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)]/60 p-4 text-xs text-[var(--base-color-brand--bean)]">
                <ReviewRow label="Account" value={currentAccount?.name ?? adAccountId} />
                <ReviewRow
                  label="Page"
                  value={pages.find((p) => p.id === pageId)?.name ?? pageId}
                />
                <ReviewRow
                  label="Campaign"
                  value={
                    campaignChoice === '__new'
                      ? `New: ${newCampaignName} · ${newCampaignObjective}`
                      : (campaigns.find((c) => c.id === campaignChoice)?.name ?? campaignChoice)
                  }
                />
                <ReviewRow
                  label="Ad set"
                  value={
                    adSetChoice === '__new'
                      ? `New: ${newAdSetName} · ${dailyBudget}/day · ${countries} · ${ageMin}–${ageMax}`
                      : (adSets.find((s) => s.id === adSetChoice)?.name ?? adSetChoice)
                  }
                />
                <ReviewRow label="Headline" value={headline} />
                <ReviewRow label="Button" value={ctaType} />
                <ReviewRow label="Link" value={link} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--base-color-brand--bean)]">
                  Ad name
                </label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="Name this ad (just for you)"
                  className="w-full rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-[var(--base-color-brand--bean)]">
                <input
                  type="checkbox"
                  checked={launchActive}
                  onChange={(e) => setLaunchActive(e.target.checked)}
                />
                Launch this ad right away (otherwise we&apos;ll save it paused)
              </label>
            </div>
          )}

          {step === 'result' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              {result ? (
                <>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--status--success)]/20 text-[var(--status--success)]">
                    <CheckIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--base-color-brand--bean)]">
                      Ad created
                    </p>
                    <p className="mt-1 text-xs text-[var(--base-color-brand--umber)]">
                      Ad id: <code>{result.adId}</code>
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      window.api.shell.openExternal(
                        `https://business.facebook.com/adsmanager/manage/ads?act=${result.adAccountId.replace(
                          /^act_/,
                          '',
                        )}&selected_ad_ids=${result.adId}`,
                      )
                    }
                    className="rounded-full border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs font-semibold text-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--champagne)]"
                  >
                    View on Facebook →
                  </button>
                </>
              ) : (
                <>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--base-color-brand--red)]/20 text-[var(--base-color-brand--red)]">
                    <span className="text-2xl">⚠</span>
                  </div>
                  <p className="text-base font-semibold text-[var(--base-color-brand--bean)]">
                    Couldn&apos;t create ad
                  </p>
                  <p className="max-w-sm text-xs text-[var(--base-color-brand--umber)]">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => setStep('review')}
                    className="rounded-full border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs font-semibold text-[var(--base-color-brand--bean)] hover:bg-[var(--base-color-brand--champagne)]"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isWizardStep && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0 || submitting}
              className="rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-5 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--bean)] transition-colors hover:bg-[var(--base-color-brand--champagne)] disabled:cursor-not-allowed disabled:opacity-0"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              Back
            </button>
            {step === 'review' ? (
              <button
                type="button"
                onClick={submit}
                disabled={!canAdvance.review || submitting}
                className="inline-grid h-[44px] grid-flow-col items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-5 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] transition-all hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--base-color-brand--dark-red)] disabled:cursor-not-allowed disabled:bg-[var(--base-color-brand--umber)] disabled:shadow-[0_3px_0_0_var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                {submitting ? (
                  <>
                    <UploadIcon className="h-3.5 w-3.5 animate-pulse" />
                    Creating…
                  </>
                ) : (
                  <>
                    <SparkleIcon />
                    Create ad
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance[step]}
                className="rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-5 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] transition-all hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--base-color-brand--dark-red)] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                Next
              </button>
            )}
          </div>
        )}
        {step === 'result' && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-5 py-2 text-xs font-semibold text-[var(--base-color-brand--shell)] shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] hover:bg-[var(--base-color-brand--red)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[var(--base-color-brand--umber)]/15 py-1 last:border-b-0">
      <span className="text-[var(--base-color-brand--umber)]">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium">{value || '—'}</span>
    </div>
  );
}
