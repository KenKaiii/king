// Soft-refusal detection for Gemini / Nano Banana Pro.
//
// When Gemini's safety filter partially fires on a multi-image edit, the
// model often returns one of the input images as the "output" rather
// than throwing an error. This utility perceptually hashes the output
// and every input image, and reports whether any pair is similar enough
// to count as a soft refusal (i.e. Gemini echoed an input back at us).
//
// Implementation is pure-JS average-hash (aHash) via a 2D canvas:
// downscale to 16×16 grayscale, compute the mean intensity, then emit a
// 256-bit bitmap where each bit is 1 if that pixel exceeds the mean.
// Hamming distance between two hashes gives a perceptual difference
// score — small distances mean the images are visually near-identical.
//
// aHash is deliberately simple (vs pHash's DCT) but plenty for this
// use case: we're only asking "is the output a near-copy of an input?"
// not "find similar photos in a 10M-image corpus". ~60 LOC, no deps,
// runs in ~5ms per image on modern hardware.

const HASH_SIZE = 16;
const HASH_BITS = HASH_SIZE * HASH_SIZE; // 256

/**
 * Hamming distance threshold under which two hashes count as "same image
 * or near-copy". Tuned empirically against Gemini's soft-refusal outputs
 * — which are often lightly re-encoded / colour-shifted versions of the
 * input, not byte-identical. 8/256 bits = ~3% mismatch, tight enough to
 * avoid false positives while catching Gemini's typical re-encodes.
 */
export const SOFT_REFUSAL_HAMMING_THRESHOLD = 8;

/**
 * Load any image URL (http, https, data:, local-file://) into a hash.
 * Throws if the image can't be decoded.
 */
export async function hashImageUrl(url: string): Promise<Uint8Array> {
  const image = await loadImage(url);
  return hashImageElement(image);
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Needed for http(s) URLs so the canvas doesn't get tainted.
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function hashImageElement(image: HTMLImageElement): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = HASH_SIZE;
  canvas.height = HASH_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not acquire 2D canvas context');

  ctx.drawImage(image, 0, 0, HASH_SIZE, HASH_SIZE);
  const { data } = ctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE);

  // Grayscale using Rec. 601 luma coefficients. `data` is RGBA, 4 bytes/px.
  const grays = new Uint8Array(HASH_BITS);
  let total = 0;
  for (let i = 0; i < HASH_BITS; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    grays[i] = y;
    total += y;
  }
  const mean = total / HASH_BITS;

  // Pack 256 bits into 32 bytes. Bit = 1 if pixel exceeds the mean.
  const hash = new Uint8Array(HASH_BITS / 8);
  for (let i = 0; i < HASH_BITS; i++) {
    if (grays[i] > mean) {
      hash[Math.floor(i / 8)] |= 1 << (i % 8);
    }
  }
  return hash;
}

/**
 * Hamming distance (number of differing bits) between two hashes.
 */
export function hammingDistance(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) {
    throw new Error(`Hash length mismatch: ${a.length} vs ${b.length}`);
  }
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    let xor = a[i] ^ b[i];
    while (xor) {
      distance += xor & 1;
      xor >>>= 1;
    }
  }
  return distance;
}

/**
 * Check whether a generated image is a soft-refusal echo of any of its
 * input references. Returns the input index that matched (0-based), or
 * null if the output is a genuine new image.
 *
 * Swallows per-image hash errors so a single broken URL never poisons
 * the whole check — we'd rather miss a soft-refusal detection than block
 * a legitimate result.
 */
export async function detectSoftRefusal(
  outputUrl: string,
  inputUrls: string[],
): Promise<{ isSoftRefusal: boolean; matchedInputIndex: number | null; distance: number }> {
  try {
    const outputHash = await hashImageUrl(outputUrl);
    let bestIndex: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < inputUrls.length; i++) {
      try {
        const inputHash = await hashImageUrl(inputUrls[i]);
        const d = hammingDistance(outputHash, inputHash);
        if (d < bestDistance) {
          bestDistance = d;
          bestIndex = i;
        }
      } catch {
        // Skip unreadable input; continue checking others.
      }
    }

    const isSoftRefusal = bestDistance <= SOFT_REFUSAL_HAMMING_THRESHOLD;

    // Log every check so we can eyeball in DevTools how close each
    // generated image comes to its inputs — useful for tuning the
    // threshold empirically against real Gemini soft-refusal behaviour
    // without having to redeploy.
    console.log(
      `[softRefusal] distance=${bestDistance}/${HASH_BITS} ` +
        `threshold=${SOFT_REFUSAL_HAMMING_THRESHOLD} ` +
        `matchedInput=${bestIndex} isSoftRefusal=${isSoftRefusal}`,
    );

    return {
      isSoftRefusal,
      matchedInputIndex: isSoftRefusal ? bestIndex : null,
      distance: bestDistance,
    };
  } catch {
    // If we can't hash the output at all, assume it's a genuine result.
    return { isSoftRefusal: false, matchedInputIndex: null, distance: -1 };
  }
}
