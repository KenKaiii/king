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

export const modelOptions = [{ value: 'nano_banana_2', label: 'Default' }];

export const aspectRatioOptions = [
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

export const resolutionOptions = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

export const outputFormatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'webp', label: 'WebP' },
];
