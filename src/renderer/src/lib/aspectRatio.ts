// Image aspect-ratio helpers shared by the custom ad-reference upload flow.
//
// `computeAspectRatio` reduces raw pixel dimensions to a clean "W:H" string
// using the greatest common divisor. To avoid noisy ratios from slightly
// off-square images (e.g. 1024x1023 -> "1024:1023"), we snap to a curated
// set of common ratios when the actual ratio is within 2% of one of them.

const COMMON_RATIOS: Array<{ label: string; value: number }> = [
  { label: '1:1', value: 1 / 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '5:4', value: 5 / 4 },
  { label: '9:16', value: 9 / 16 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
  { label: '4:3', value: 4 / 3 },
  { label: '2:3', value: 2 / 3 },
  { label: '3:2', value: 3 / 2 },
];

const SNAP_TOLERANCE = 0.02;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function computeAspectRatio(width: number, height: number): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return '1:1';
  }
  const ratio = width / height;
  for (const candidate of COMMON_RATIOS) {
    if (Math.abs(ratio - candidate.value) / candidate.value <= SNAP_TOLERANCE) {
      return candidate.label;
    }
  }
  const w = Math.round(width);
  const h = Math.round(height);
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

/**
 * Read a File's natural pixel dimensions in the renderer using an in-memory
 * object URL. Resolves to width/height + a simplified aspect-ratio string
 * suitable for storing alongside the uploaded reference.
 */
export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number; aspectRatio: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (!width || !height) {
        reject(new Error("Couldn't read image dimensions."));
        return;
      }
      resolve({ width, height, aspectRatio: computeAspectRatio(width, height) });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't load the image."));
    };
    img.src = url;
  });
}
