// Curated reference ads shown on the Create Ads page.
//
// Each AdReference represents one ad *concept*. An ad may have multiple
// `variants` (e.g. the same creative rendered in 1:1, 4:5, and 9:16). When
// the user picks an ad and a target aspect ratio, the generator picks the
// variant whose aspectRatio matches — falling back to the first variant if
// there's no exact match.
//
// To group multiple files as variants of the same ad, merge them into one
// entry by combining their `variants` arrays under a shared `id`.

import beauty1 from '@/assets/ad-references/beauty-1.jpg';
import beauty2 from '@/assets/ad-references/beauty-2.jpg';
import beauty3 from '@/assets/ad-references/beauty-3.jpg';
import beauty4 from '@/assets/ad-references/beauty-4.jpg';
import health1 from '@/assets/ad-references/health-1.jpg';
import health2 from '@/assets/ad-references/health-2.jpg';
import health3 from '@/assets/ad-references/health-3.jpg';
import health4 from '@/assets/ad-references/health-4.jpg';
import health6 from '@/assets/ad-references/health-6.jpg';
import health7 from '@/assets/ad-references/health-7.jpg';
import health8 from '@/assets/ad-references/health-8.jpg';
import health9 from '@/assets/ad-references/health-9.jpg';
import health10 from '@/assets/ad-references/health-10.jpg';
import health11 from '@/assets/ad-references/health-11.jpg';
import health12 from '@/assets/ad-references/health-12.jpg';
import health13 from '@/assets/ad-references/health-13.jpg';
import health14 from '@/assets/ad-references/health-14.jpg';
import health15 from '@/assets/ad-references/health-15.jpg';
import health16 from '@/assets/ad-references/health-16.jpg';
import health17 from '@/assets/ad-references/health-17.jpg';
import health18 from '@/assets/ad-references/health-18.jpg';
import supp1 from '@/assets/ad-references/supp-1.jpg';
import supp2 from '@/assets/ad-references/supp-2.jpg';
import supp3 from '@/assets/ad-references/supp-3.jpg';
import supp4 from '@/assets/ad-references/supp-4.jpg';

export type AdCategory = 'beauty' | 'health' | 'supp';

export const AD_CATEGORY_LABELS: Record<AdCategory, string> = {
  beauty: 'Beauty',
  health: 'Health',
  supp: 'Supplements',
};

export interface AdVariant {
  /** Aspect ratio of this variant, matching the `aspectRatioOptions` values. */
  aspectRatio: string;
  imageUrl: string;
}

export interface AdReference {
  id: string;
  category: AdCategory;
  variants: AdVariant[];
}

/**
 * Pick the variant of an ad that best matches the user's chosen output
 * aspect ratio. Falls back to the first available variant when there is no
 * exact match (e.g. user selected 16:9 but the ad only ships as 9:16).
 */
export function pickVariant(ad: AdReference, aspectRatio: string): AdVariant {
  return ad.variants.find((v) => v.aspectRatio === aspectRatio) ?? ad.variants[0];
}

/**
 * Thumbnail shown in the picker UI. Prefers a 1:1 (square) variant when
 * one exists — it reads cleanest in the square tile — and otherwise falls
 * back to the first available variant.
 */
export function getThumbnail(ad: AdReference): string {
  const square = ad.variants.find((v) => v.aspectRatio === '1:1');
  return (square ?? ad.variants[0]).imageUrl;
}

export const AD_REFERENCES: AdReference[] = [
  // --- Beauty ---
  {
    id: 'beauty-1',
    category: 'beauty',
    variants: [
      { aspectRatio: '9:16', imageUrl: beauty1 },
      { aspectRatio: '1:1', imageUrl: beauty2 },
    ],
  },
  { id: 'beauty-3', category: 'beauty', variants: [{ aspectRatio: '9:16', imageUrl: beauty3 }] },
  { id: 'beauty-4', category: 'beauty', variants: [{ aspectRatio: '9:16', imageUrl: beauty4 }] },

  // --- Health ---
  { id: 'health-1', category: 'health', variants: [{ aspectRatio: '4:5', imageUrl: health1 }] },
  { id: 'health-2', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health2 }] },
  { id: 'health-3', category: 'health', variants: [{ aspectRatio: '1:1', imageUrl: health3 }] },
  { id: 'health-4', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health4 }] },
  { id: 'health-6', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health6 }] },
  { id: 'health-7', category: 'health', variants: [{ aspectRatio: '1:1', imageUrl: health7 }] },
  { id: 'health-8', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health8 }] },
  { id: 'health-9', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health9 }] },
  { id: 'health-10', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health10 }] },
  { id: 'health-11', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health11 }] },
  { id: 'health-12', category: 'health', variants: [{ aspectRatio: '4:5', imageUrl: health12 }] },
  { id: 'health-13', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health13 }] },
  { id: 'health-14', category: 'health', variants: [{ aspectRatio: '4:5', imageUrl: health14 }] },
  { id: 'health-15', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health15 }] },
  { id: 'health-16', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health16 }] },
  { id: 'health-17', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health17 }] },
  { id: 'health-18', category: 'health', variants: [{ aspectRatio: '9:16', imageUrl: health18 }] },

  // --- Supplements ---
  { id: 'supp-1', category: 'supp', variants: [{ aspectRatio: '9:16', imageUrl: supp1 }] },
  { id: 'supp-2', category: 'supp', variants: [{ aspectRatio: '1:1', imageUrl: supp2 }] },
  {
    id: 'supp-3',
    category: 'supp',
    variants: [
      { aspectRatio: '9:16', imageUrl: supp3 },
      { aspectRatio: '1:1', imageUrl: supp4 },
    ],
  },
];
