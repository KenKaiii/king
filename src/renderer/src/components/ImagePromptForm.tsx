import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import SelectDropdown from '@/components/ui/SelectDropdown';
import {
  PlusIcon,
  MinusIcon,
  SparkleIcon,
  CloseIcon,
  ResolutionIcon,
  FormatIcon,
  AutoIcon,
  aspectRatioIcons,
  ImageAddIcon,
} from '@/components/icons';
import {
  modelOptions,
  aspectRatioOptions,
  resolutionOptions,
  outputFormatOptions,
  MAX_REFERENCE_IMAGES,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGES_PER_GENERATION,
} from '@/lib/constants/image-form';

interface ReferenceImage {
  id: string;
  file?: File;
  preview: string;
  url?: string;
  isLoading: boolean;
}

interface ImagePromptFormProps {
  onSubmit?: (data: {
    prompt: string;
    model: string;
    count: number;
    aspectRatio: string;
    resolution: string;
    outputFormat: string;
    referenceImages: string[];
  }) => void;
  initialPrompt?: string;
  recreateData?: { prompt: string } | null;
  editData?: { imageUrl: string } | null;
}

export default function ImagePromptForm({
  onSubmit,
  initialPrompt = '',
  recreateData,
  editData,
}: ImagePromptFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [model, setModel] = useState('nano_banana_2');
  const [imageCount, setImageCount] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [outputFormat, setOutputFormat] = useState('png');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxImages = MAX_IMAGES_PER_GENERATION;

  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '40px';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [prompt, autoResizeTextarea]);

  // Handle recreate data
  useEffect(() => {
    if (recreateData) {
      setPrompt(recreateData.prompt);
      setReferenceImages([]);
    }
  }, [recreateData]);

  // Handle edit data
  useEffect(() => {
    if (!editData?.imageUrl) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPrompt('');
    setReferenceImages([
      {
        id,
        preview: editData.imageUrl,
        url: editData.imageUrl,
        isLoading: false,
      },
    ]);
  }, [editData]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) continue;
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) continue;
        if (referenceImages.length + validFiles.length >= MAX_REFERENCE_IMAGES) break;
        validFiles.push(file);
      }

      const pendingImages: ReferenceImage[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        isLoading: false, // No upload needed in Electron - we use local file paths
        url: URL.createObjectURL(file),
      }));

      setReferenceImages((prev) =>
        [...prev, ...pendingImages].slice(0, MAX_REFERENCE_IMAGES),
      );
      e.target.value = '';
    },
    [referenceImages.length],
  );

  const removeReferenceImage = useCallback((id: string) => {
    setReferenceImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const isImagesLoading = referenceImages.some((img) => img.isLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isImagesLoading) return;

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const uploadedImageUrls = referenceImages
      .filter((img) => img.url)
      .map((img) => img.url as string);

    onSubmit?.({
      prompt,
      model,
      count: imageCount,
      aspectRatio,
      resolution,
      outputFormat,
      referenceImages: uploadedImageUrls,
    });
  };

  const incrementCount = () => {
    setImageCount((prev) => Math.min(prev + 1, maxImages));
  };

  const decrementCount = () => {
    setImageCount((prev) => Math.max(prev - 1, 1));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-x-1/2 bottom-4 z-20 hidden w-full -translate-x-1/2 rounded-[2rem] border border-white/10 bg-black/60 p-[22px] backdrop-blur-xl md:block lg:max-w-[65rem] lg:min-w-[1000px]"
    >
      <fieldset className="relative z-20 flex gap-3">
        {/* Left section */}
        <div className="min-h-0 min-w-0 flex-1 space-y-3">
          {/* Reference images preview */}
          {referenceImages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {referenceImages.map((img) => (
                <div key={img.id} className="group relative shrink-0">
                  <div className="relative size-14 rounded-xl bg-white/10">
                    {img.isLoading ? (
                      <div className="size-full animate-[shimmer_1.5s_infinite] animate-pulse rounded-xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%]" />
                    ) : (
                      <>
                        <img
                          src={img.preview}
                          alt="Reference"
                          className="size-full rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeReferenceImage(img.id)}
                          className="absolute -top-3 -right-3 z-10 grid h-6 w-6 items-center justify-center rounded-lg border border-white/20 bg-black/60 text-white transition hover:bg-white/20 xl:opacity-0 xl:group-hover:opacity-100"
                        >
                          <CloseIcon />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {referenceImages.length < MAX_REFERENCE_IMAGES && (
                <div className="relative size-14 shrink-0 rounded-xl bg-white/10">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid size-full cursor-pointer items-center justify-center text-white transition active:opacity-60"
                  >
                    <ImageAddIcon />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt row */}
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={handleFileSelect}
            />
            {referenceImages.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative -top-[5.5px] grid h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] border border-white/10 bg-white/5 text-white transition hover:bg-pink-400/10 hover:text-pink-400"
                title="Add reference images (max 8)"
              >
                <PlusIcon />
              </button>
            )}
            <textarea
              ref={textareaRef}
              name="prompt"
              placeholder="Describe the scene you imagine"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isImagesLoading && prompt.trim()) {
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }
              }}
              className="hide-scrollbar max-h-[120px] min-h-[40px] w-full resize-none rounded-none border-none bg-transparent p-0 text-[15px] text-white placeholder:text-zinc-400 focus:outline-none"
            />
          </div>

          {/* Controls row */}
          <div className="flex h-9 items-center gap-2">
            <SelectDropdown
              options={modelOptions}
              value={model}
              onChange={(value) => setModel(value)}
            />

            {/* Image count selector */}
            <div className="flex h-10 items-center gap-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3">
              <button
                type="button"
                onClick={decrementCount}
                disabled={imageCount <= 1}
                className="text-zinc-300 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300"
              >
                <MinusIcon />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-white">
                {imageCount}
                <span className="text-zinc-400">/{maxImages}</span>
              </span>
              <button
                type="button"
                onClick={incrementCount}
                disabled={imageCount >= maxImages}
                className="text-zinc-300 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300"
              >
                <PlusIcon />
              </button>
            </div>

            <SelectDropdown
              options={aspectRatioOptions}
              value={aspectRatio}
              onChange={setAspectRatio}
              icon={aspectRatioIcons[aspectRatio] || <AutoIcon />}
              showIcons
            />

            <SelectDropdown
              options={resolutionOptions}
              value={resolution}
              onChange={setResolution}
              icon={<ResolutionIcon />}
            />

            <SelectDropdown
              options={outputFormatOptions}
              value={outputFormat}
              onChange={setOutputFormat}
              icon={<FormatIcon />}
            />
          </div>
        </div>

        {/* Right section - Generate button */}
        <aside className="flex h-[84px] items-end justify-end gap-3 self-end">
          <button
            type="submit"
            disabled={isImagesLoading}
            tabIndex={-1}
            className="inline-grid h-full w-36 grid-flow-col items-center justify-center gap-2 rounded-lg bg-pink-400 px-2.5 text-sm font-semibold text-black shadow-[0_4px_0_0_#be185d] transition-all duration-150 hover:bg-pink-500 hover:shadow-[0_4px_0_0_#9d174d] focus:outline-none active:translate-y-0.5 active:shadow-[0_2px_0_0_#be185d] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-[0_4px_0_0_#3f3f46]"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {isImagesLoading ? 'Uploading...' : 'Generate'}
              </span>
              <SparkleIcon />
            </div>
          </button>
        </aside>
      </fieldset>
    </form>
  );
}
