import { readFileSync } from 'fs';
import { extname } from 'path';
import { resolveLocalFileUrl } from '../services/paths';
import { secureHandle } from './validateSender';

// Google's Gemini 3 Pro Image via fal.ai. Pricing: $0.15/image at 1K/2K,
// $0.30 at 4K. Edit endpoint accepts up to 14 reference images.
const NANO_BANANA_PRO_MODEL = 'fal-ai/nano-banana-pro';
const NANO_BANANA_PRO_EDIT_MODEL = 'fal-ai/nano-banana-pro/edit';

// OpenAI GPT Image 2 via fal.ai. Top-tier text rendering and photoreal.
// Pricing is token-based — practically $0.01/image at low/1024x768 up to
// $0.41/image at high/4K. Edit endpoint runs the same underlying model.
// Both endpoints are namespaced under `openai/...` per fal's official
// launch announcement (April 21, 2026).
// https://fal.ai/models/openai/gpt-image-2
const GPT_IMAGE_2_MODEL = 'openai/gpt-image-2';
const GPT_IMAGE_2_EDIT_MODEL = 'openai/gpt-image-2/edit';

export type ModelVariant = 'nano_banana_pro' | 'gpt_image_2';

interface GenerateImageData {
  prompt: string;
  aspectRatio: string;
  resolution: string;
  outputFormat: string;
  imageUrls: string[];
  /** Which fal model to route through. Picked from the Settings modal. */
  modelVariant?: ModelVariant;
}

// Mirror of the renderer's SUPPORTED_IMAGE_MIME_TYPES — covers every
// format Google Gemini's image input accepts: PNG, JPEG, WebP, HEIC, HEIF.
// https://ai.google.dev/gemini-api/docs/image-understanding
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

function resolveImageUrl(url: string): string {
  if (url.startsWith('data:') || url.startsWith('http')) return url;

  if (url.startsWith('local-file://')) {
    const filePath = resolveLocalFileUrl(url);
    if (!filePath) return url;
    const buffer = readFileSync(filePath);
    const ext = extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  return url;
}

const MISSING_KEY_MESSAGE =
  "Your image generator isn't connected yet. Open the APIs page and add your fal.ai key to get started.";
const INVALID_KEY_MESSAGE =
  "Your fal.ai key didn't work. Double-check it on the APIs page and save a fresh one if needed.";
const OUT_OF_CREDITS_MESSAGE =
  'Your fal.ai account is locked — usually because the balance ran out. If you just topped up, give it a minute to sync and try again. Otherwise top up at fal.ai/dashboard/billing, or check that your API key belongs to the account you topped up.';
const SAFETY_BLOCK_MESSAGE =
  'Google blocked this one as a safety precaution. The filter is probabilistic — hitting Try again often works, especially on face-swap and character workflows.';
const VALIDATION_MESSAGE =
  "Something about this request wasn't accepted. Try a different image or prompt.";

/**
 * Detect Gemini / Nano Banana Pro safety-filter refusals. Gemini wraps
 * both its prompt-level and post-generation safety blocks inside a 422
 * with a generic "did not generate the expected output" body — we match
 * on that phrase (and its known variants) so we can surface an actionable
 * message instead of the cryptic default.
 */
function isSafetyBlock(message: string): boolean {
  return /\b(unsafe content|did not generate the expected output|prohibited[_ ]content|image[_ ]safety)\b/i.test(
    message,
  );
}

/**
 * Walk a fal error body looking for the underlying human-readable message.
 * fal errors vary in shape — sometimes `{detail: "..."}`, sometimes
 * `{detail: [{msg, loc, type}]}`, sometimes a top-level `.message`. This
 * returns whatever text we can find so we can keyword-match it.
 */
function extractFalMessage(err: { body?: unknown; message?: string }): string {
  const parts: string[] = [];
  if (typeof err.message === 'string') parts.push(err.message);
  const body = err.body as { detail?: unknown; message?: string; error?: string } | undefined;
  if (body) {
    if (typeof body.message === 'string') parts.push(body.message);
    if (typeof body.error === 'string') parts.push(body.error);
    if (typeof body.detail === 'string') parts.push(body.detail);
    if (Array.isArray(body.detail)) {
      for (const d of body.detail) {
        if (d && typeof d === 'object' && 'msg' in d && typeof d.msg === 'string') {
          parts.push(d.msg);
        }
      }
    }
  }
  return parts.join(' | ');
}

function isOutOfCredits(status: number | undefined, message: string): boolean {
  // 402 Payment Required is the canonical HTTP status, but fal has also been
  // observed returning 401/403 with a credits-related message in the body.
  if (status === 402) return true;
  return /\b(insufficient (balance|credits|funds)|out of credits|exhausted|quota|top up|billing|payment required)\b/i.test(
    message,
  );
}

function isAuthFailure(status: number | undefined, message: string): boolean {
  if (status === 401) return true;
  if (status === 403) return true;
  return /\b(unauthorized|invalid api key|invalid key|forbidden)\b/i.test(message);
}

function selectModel(variant: ModelVariant, hasReferenceImages: boolean): string {
  if (variant === 'gpt_image_2') {
    return hasReferenceImages ? GPT_IMAGE_2_EDIT_MODEL : GPT_IMAGE_2_MODEL;
  }
  return hasReferenceImages ? NANO_BANANA_PRO_EDIT_MODEL : NANO_BANANA_PRO_MODEL;
}

/**
 * Map our app-level aspect ratio strings to GPT Image 2's `image_size`
 * presets. GPT only ships these enum values via fal — anything else
 * falls back to `auto` (model infers output dimensions). We do not
 * fabricate custom {width, height} values; the user asked for the docs'
 * options as-is.
 *   https://fal.ai/models/openai/gpt-image-2/api
 */
function mapAspectToGptImageSize(aspectRatio: string): string {
  switch (aspectRatio) {
    case '1:1':
      return 'square_hd';
    case '4:3':
      return 'landscape_4_3';
    case '3:4':
      return 'portrait_4_3';
    case '16:9':
      return 'landscape_16_9';
    case '9:16':
      return 'portrait_16_9';
    case 'auto':
      return 'auto';
    default:
      return 'auto';
  }
}

/**
 * GPT Image 2 has only two quality tiers (`low` / `high`) instead of the
 * 1K/2K/4K resolution ladder Nano Banana exposes. 1K → low (cheap), 2K
 * and 4K → high (default).
 */
function mapResolutionToGptQuality(resolution: string): 'low' | 'high' {
  return resolution === 'low' || resolution === '1K' ? 'low' : 'high';
}

function buildNanoBananaInput(
  data: GenerateImageData,
  resolvedUrls: string[],
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    prompt: data.prompt,
    aspect_ratio: data.aspectRatio || '1:1',
    resolution: data.resolution || '1K',
    output_format: data.outputFormat || 'png',
    num_images: 1,
    // Most-permissive Layer-1 safety setting (fal scale: 1 strictest,
    // 6 least strict, default 4). Doesn't bypass Google's Layer-2 policy
    // filter — most refusals originate there — but eliminates false-
    // positive Layer-1 blocks that otherwise steal ~5-10% of generations.
    safety_tolerance: '6',
  };
  if (resolvedUrls.length > 0) {
    input.image_urls = resolvedUrls;
  }
  return input;
}

function buildGptImage2Input(
  data: GenerateImageData,
  resolvedUrls: string[],
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    prompt: data.prompt,
    image_size: mapAspectToGptImageSize(data.aspectRatio),
    quality: mapResolutionToGptQuality(data.resolution),
    output_format: data.outputFormat || 'png',
    num_images: 1,
  };
  if (resolvedUrls.length > 0) {
    input.image_urls = resolvedUrls;
  }
  return input;
}

export function registerGenerateHandlers(): void {
  secureHandle('generate:image', async (_event, data: GenerateImageData) => {
    // Surface a friendly error up-front rather than letting the SDK throw a
    // cryptic `Unauthorized` from fal's servers. Every caller (Image page,
    // Create Ads, future pages) goes through this handler, so fixing it here
    // covers everything.
    if (!process.env.FAL_KEY) {
      throw new Error(MISSING_KEY_MESSAGE);
    }

    const { fal } = await import('@fal-ai/client');

    const resolvedUrls = (data.imageUrls || [])
      .map(resolveImageUrl)
      .filter((u) => u.startsWith('data:') || u.startsWith('http'));

    const hasReferenceImages = resolvedUrls.length > 0;
    const variant: ModelVariant =
      data.modelVariant === 'gpt_image_2' ? 'gpt_image_2' : 'nano_banana_pro';
    const model = selectModel(variant, hasReferenceImages);

    const input =
      variant === 'gpt_image_2'
        ? buildGptImage2Input(data, resolvedUrls)
        : buildNanoBananaInput(data, resolvedUrls);

    try {
      const result = await fal.subscribe(model, { input, logs: true });

      const resultData = result.data as {
        images?: Array<{ url: string }>;
      };

      const resultUrls = resultData.images?.map((img: { url: string }) => img.url) ?? [];

      return { success: true, resultUrls };
    } catch (err) {
      const e = err as { status?: number; body?: unknown; message?: string };
      const falMessage = extractFalMessage(e);

      // Log the full fal error body once so we can diagnose new error shapes
      // without the user needing to DevTools the renderer.
      console.error(
        '[generate:image] fal error — status:',
        e?.status,
        '\nmessage:',
        e?.message,
        '\nbody:',
        JSON.stringify(e?.body, null, 2),
      );

      // Check credits BEFORE auth — fal sometimes returns 401/403 with a
      // credits message in the body, and we want to surface that correctly
      // rather than telling the user their key is broken.
      if (isOutOfCredits(e?.status, falMessage)) {
        throw new Error(OUT_OF_CREDITS_MESSAGE);
      }

      if (isAuthFailure(e?.status, falMessage)) {
        throw new Error(INVALID_KEY_MESSAGE);
      }

      if (e?.status === 422) {
        console.error(
          '[generate:image] 422 ValidationError — fal detail:',
          JSON.stringify(e.body, null, 2),
          '\nmodel:',
          model,
          '\ninput keys:',
          Object.keys(input),
          '\nimage_urls count:',
          hasReferenceImages ? resolvedUrls.length : 0,
        );

        // Safety-filter refusals come through as 422s with a generic
        // Gemini message. Detect and surface a useful error instead of
        // the generic validation one.
        if (isSafetyBlock(falMessage)) {
          throw new Error(SAFETY_BLOCK_MESSAGE);
        }

        const details =
          (e.body as { detail?: Array<{ loc?: unknown[]; msg?: string; type?: string }> })
            ?.detail ?? [];
        const msg = details
          .map((d) => `${(d.loc ?? []).join('.')}: ${d.msg ?? d.type ?? 'invalid'}`)
          .join('; ');
        console.error('[generate:image] validation detail:', msg);
        throw new Error(VALIDATION_MESSAGE);
      }
      throw err;
    }
  });
}
