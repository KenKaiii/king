export const MAX_REFERENCE_IMAGES = 8;
export const MAX_IMAGE_SIZE_MB = 30;
export const MAX_IMAGES_PER_GENERATION = 4;

// Image input formats. Limited to what Google's Gemini API officially
// accepts for image inputs — PNG, JPEG, WebP, HEIC, HEIF. AVIF, GIF, BMP,
// and TIFF are *not* supported by Gemini and will be rejected server-side,
// so we refuse them up-front rather than let a broken upload reach fal.
//
// Source: https://ai.google.dev/gemini-api/docs/image-understanding
//   "Gemini supports the following image format MIME types: PNG image/png,
//    JPEG image/jpeg, WEBP image/webp, HEIC image/heic, HEIF image/heif"
export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

/** HTML `<input accept=...>` value for file pickers. */
export const SUPPORTED_IMAGE_ACCEPT = SUPPORTED_IMAGE_MIME_TYPES.join(',');

/** Regex used to validate File.type values from user uploads. */
export const SUPPORTED_IMAGE_MIME_REGEX = /^image\/(jpeg|jpg|png|webp|heic|heif)$/i;

// Aspect ratios supported by Nano Banana Pro (Google Gemini 3 Pro Image).
// Full ladder; matches what fal exposes on `fal-ai/nano-banana-pro`.
export const nanoBananaAspectRatioOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '2:3', label: '2:3' },
  { value: '3:2', label: '3:2' },
  { value: '3:4', label: '3:4' },
  { value: '4:3', label: '4:3' },
  { value: '4:5', label: '4:5' },
  { value: '5:4', label: '5:4' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
  { value: '21:9', label: '21:9' },
];

// Aspect ratios supported by GPT Image 2 — only the `image_size` enum
// values fal documents. Anything else is not customised here.
//   https://fal.ai/models/openai/gpt-image-2/api
export const gptImage2AspectRatioOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
];

// Backwards-compatible default export (used by tests, fallbacks). Mirrors
// the Nano Banana ladder which is the broader of the two.
export const aspectRatioOptions = nanoBananaAspectRatioOptions;

export const nanoBananaResolutionOptions = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

// GPT Image 2 has only two quality tiers (`low` / `high`). We surface
// these in place of the resolution dropdown when GPT is selected.
export const gptImage2QualityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
];

export const resolutionOptions = nanoBananaResolutionOptions;

export const outputFormatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'webp', label: 'WebP' },
];
