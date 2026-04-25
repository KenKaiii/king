import { describe, it, expect, vi } from 'vitest';

// Mock all .jpg asset imports so Vite asset resolution is not required.
// The mock returns a string path, which is all the source module needs.
vi.mock('@/assets/prompts/product-mirror-selfie.jpg', () => ({ default: 'product-mirror-selfie.jpg' }));
vi.mock('@/assets/prompts/amazon-packshot.jpg', () => ({ default: 'amazon-packshot.jpg' }));
vi.mock('@/assets/prompts/footwear-packshot.jpg', () => ({ default: 'footwear-packshot.jpg' }));
vi.mock('@/assets/prompts/apparel-flatlay.jpg', () => ({ default: 'apparel-flatlay.jpg' }));
vi.mock('@/assets/prompts/beauty-bottle.jpg', () => ({ default: 'beauty-bottle.jpg' }));
vi.mock('@/assets/prompts/skincare-jar.jpg', () => ({ default: 'skincare-jar.jpg' }));
vi.mock('@/assets/prompts/retail-box.jpg', () => ({ default: 'retail-box.jpg' }));
vi.mock('@/assets/prompts/ceramic-mug.jpg', () => ({ default: 'ceramic-mug.jpg' }));
vi.mock('@/assets/prompts/backpack-packshot.jpg', () => ({ default: 'backpack-packshot.jpg' }));
vi.mock('@/assets/prompts/steel-bottle.jpg', () => ({ default: 'steel-bottle.jpg' }));
vi.mock('@/assets/prompts/toy-figurine.jpg', () => ({ default: 'toy-figurine.jpg' }));
vi.mock('@/assets/prompts/headphones-desk.jpg', () => ({ default: 'headphones-desk.jpg' }));
vi.mock('@/assets/prompts/shoe-pavement.jpg', () => ({ default: 'shoe-pavement.jpg' }));
vi.mock('@/assets/prompts/skincare-bathroom.jpg', () => ({ default: 'skincare-bathroom.jpg' }));
vi.mock('@/assets/prompts/coffee-mug-kitchen.jpg', () => ({ default: 'coffee-mug-kitchen.jpg' }));
vi.mock('@/assets/prompts/backpack-hook.jpg', () => ({ default: 'backpack-hook.jpg' }));
vi.mock('@/assets/prompts/knife-cutting-board.jpg', () => ({ default: 'knife-cutting-board.jpg' }));
vi.mock('@/assets/prompts/yoga-mat-studio.jpg', () => ({ default: 'yoga-mat-studio.jpg' }));
vi.mock('@/assets/prompts/watch-wrist.jpg', () => ({ default: 'watch-wrist.jpg' }));
vi.mock('@/assets/prompts/sunglasses-towel.jpg', () => ({ default: 'sunglasses-towel.jpg' }));
vi.mock('@/assets/prompts/bottle-fridge.jpg', () => ({ default: 'bottle-fridge.jpg' }));
vi.mock('@/assets/prompts/jewelry-diffusion.jpg', () => ({ default: 'jewelry-diffusion.jpg' }));
vi.mock('@/assets/prompts/glass-bottle-backlit.jpg', () => ({ default: 'glass-bottle-backlit.jpg' }));
vi.mock('@/assets/prompts/textile-macro.jpg', () => ({ default: 'textile-macro.jpg' }));
vi.mock('@/assets/prompts/white-on-white.jpg', () => ({ default: 'white-on-white.jpg' }));
vi.mock('@/assets/prompts/cosmetics-swatches.jpg', () => ({ default: 'cosmetics-swatches.jpg' }));
vi.mock('@/assets/prompts/beverage-splash-explosion.jpg', () => ({ default: 'beverage-splash-explosion.jpg' }));
vi.mock('@/assets/prompts/fruit-splash-product.jpg', () => ({ default: 'fruit-splash-product.jpg' }));
vi.mock('@/assets/prompts/coffee-pour-commercial.jpg', () => ({ default: 'coffee-pour-commercial.jpg' }));
vi.mock('@/assets/prompts/product-levitation.jpg', () => ({ default: 'product-levitation.jpg' }));
vi.mock('@/assets/prompts/ingredient-explosion.jpg', () => ({ default: 'ingredient-explosion.jpg' }));
vi.mock('@/assets/prompts/floating-luxury.jpg', () => ({ default: 'floating-luxury.jpg' }));
vi.mock('@/assets/prompts/luxury-perfume-editorial.jpg', () => ({ default: 'luxury-perfume-editorial.jpg' }));
vi.mock('@/assets/prompts/premium-serum-macro.jpg', () => ({ default: 'premium-serum-macro.jpg' }));
vi.mock('@/assets/prompts/luxury-flat-lay.jpg', () => ({ default: 'luxury-flat-lay.jpg' }));
vi.mock('@/assets/prompts/marble-pedestal.jpg', () => ({ default: 'marble-pedestal.jpg' }));
vi.mock('@/assets/prompts/hand-held-beauty.jpg', () => ({ default: 'hand-held-beauty.jpg' }));
vi.mock('@/assets/prompts/skincare-routine-flatlay.jpg', () => ({ default: 'skincare-routine-flatlay.jpg' }));
vi.mock('@/assets/prompts/cosmetics-water-float.jpg', () => ({ default: 'cosmetics-water-float.jpg' }));
vi.mock('@/assets/prompts/beauty-glow-shot.jpg', () => ({ default: 'beauty-glow-shot.jpg' }));
vi.mock('@/assets/prompts/forest-floor-product.jpg', () => ({ default: 'forest-floor-product.jpg' }));
vi.mock('@/assets/prompts/botanical-garden.jpg', () => ({ default: 'botanical-garden.jpg' }));
vi.mock('@/assets/prompts/fantasy-meadow.jpg', () => ({ default: 'fantasy-meadow.jpg' }));
vi.mock('@/assets/prompts/plush-fabric-render.jpg', () => ({ default: 'plush-fabric-render.jpg' }));
vi.mock('@/assets/prompts/chrome-prismatic.jpg', () => ({ default: 'chrome-prismatic.jpg' }));
vi.mock('@/assets/prompts/frosted-glass-product.jpg', () => ({ default: 'frosted-glass-product.jpg' }));
vi.mock('@/assets/prompts/nine-panel-product-grid.jpg', () => ({ default: 'nine-panel-product-grid.jpg' }));
vi.mock('@/assets/prompts/before-after-split.jpg', () => ({ default: 'before-after-split.jpg' }));
vi.mock('@/assets/prompts/summer-vibes-product.jpg', () => ({ default: 'summer-vibes-product.jpg' }));
vi.mock('@/assets/prompts/cozy-winter-product.jpg', () => ({ default: 'cozy-winter-product.jpg' }));
vi.mock('@/assets/prompts/spring-fresh-product.jpg', () => ({ default: 'spring-fresh-product.jpg' }));
vi.mock('@/assets/prompts/serum-dropper-macro.jpg', () => ({ default: 'serum-dropper-macro.jpg' }));
vi.mock('@/assets/prompts/cream-jar-texture-swirl.jpg', () => ({ default: 'cream-jar-texture-swirl.jpg' }));
vi.mock('@/assets/prompts/skincare-water-stone.jpg', () => ({ default: 'skincare-water-stone.jpg' }));
vi.mock('@/assets/prompts/skincare-scrub-explosion.jpg', () => ({ default: 'skincare-scrub-explosion.jpg' }));
vi.mock('@/assets/prompts/face-mask-squeeze.jpg', () => ({ default: 'face-mask-squeeze.jpg' }));
vi.mock('@/assets/prompts/moisturizer-dewy-skin.jpg', () => ({ default: 'moisturizer-dewy-skin.jpg' }));
vi.mock('@/assets/prompts/skincare-vanity-shelfie.jpg', () => ({ default: 'skincare-vanity-shelfie.jpg' }));
vi.mock('@/assets/prompts/lipstick-bullet-macro.jpg', () => ({ default: 'lipstick-bullet-macro.jpg' }));
vi.mock('@/assets/prompts/foundation-swatch-skin.jpg', () => ({ default: 'foundation-swatch-skin.jpg' }));
vi.mock('@/assets/prompts/eyeshadow-palette-scatter.jpg', () => ({ default: 'eyeshadow-palette-scatter.jpg' }));
vi.mock('@/assets/prompts/mascara-wand-closeup.jpg', () => ({ default: 'mascara-wand-closeup.jpg' }));
vi.mock('@/assets/prompts/blush-compact-shatter.jpg', () => ({ default: 'blush-compact-shatter.jpg' }));
vi.mock('@/assets/prompts/makeup-brush-powder-burst.jpg', () => ({ default: 'makeup-brush-powder-burst.jpg' }));
vi.mock('@/assets/prompts/lip-gloss-drip.jpg', () => ({ default: 'lip-gloss-drip.jpg' }));
vi.mock('@/assets/prompts/perfume-dark-woody.jpg', () => ({ default: 'perfume-dark-woody.jpg' }));
vi.mock('@/assets/prompts/perfume-floral-petals.jpg', () => ({ default: 'perfume-floral-petals.jpg' }));
vi.mock('@/assets/prompts/perfume-meadow-fantasy.jpg', () => ({ default: 'perfume-meadow-fantasy.jpg' }));
vi.mock('@/assets/prompts/perfume-mist-spray.jpg', () => ({ default: 'perfume-mist-spray.jpg' }));
vi.mock('@/assets/prompts/shampoo-pour-silk.jpg', () => ({ default: 'shampoo-pour-silk.jpg' }));
vi.mock('@/assets/prompts/body-oil-golden-pour.jpg', () => ({ default: 'body-oil-golden-pour.jpg' }));
vi.mock('@/assets/prompts/bath-bomb-fizz.jpg', () => ({ default: 'bath-bomb-fizz.jpg' }));
vi.mock('@/assets/prompts/nail-polish-drip.jpg', () => ({ default: 'nail-polish-drip.jpg' }));
vi.mock('@/assets/prompts/nail-polish-spill-art.jpg', () => ({ default: 'nail-polish-spill-art.jpg' }));
vi.mock('@/assets/prompts/jewelry-on-skin.jpg', () => ({ default: 'jewelry-on-skin.jpg' }));
vi.mock('@/assets/prompts/beauty-bathroom-steam.jpg', () => ({ default: 'beauty-bathroom-steam.jpg' }));
vi.mock('@/assets/prompts/beauty-hand-apply.jpg', () => ({ default: 'beauty-hand-apply.jpg' }));
vi.mock('@/assets/prompts/beauty-mirror-reflection.jpg', () => ({ default: 'beauty-mirror-reflection.jpg' }));
vi.mock('@/assets/prompts/beauty-silk-fabric.jpg', () => ({ default: 'beauty-silk-fabric.jpg' }));
vi.mock('@/assets/prompts/beauty-ice-cold.jpg', () => ({ default: 'beauty-ice-cold.jpg' }));
vi.mock('@/assets/prompts/beauty-citrus-splash.jpg', () => ({ default: 'beauty-citrus-splash.jpg' }));
vi.mock('@/assets/prompts/beauty-honey-drizzle.jpg', () => ({ default: 'beauty-honey-drizzle.jpg' }));
vi.mock('@/assets/prompts/beauty-rose-petals-bath.jpg', () => ({ default: 'beauty-rose-petals-bath.jpg' }));
vi.mock('@/assets/prompts/beauty-cotton-cloud.jpg', () => ({ default: 'beauty-cotton-cloud.jpg' }));
vi.mock('@/assets/prompts/beauty-aloe-gel.jpg', () => ({ default: 'beauty-aloe-gel.jpg' }));

import { prompts, type Prompt } from '@/lib/prompts';

describe('prompts', () => {
  it('has a non-empty, de-duplicated set of prompt entries', () => {
    // A hardcoded count rots every time a prompt is added/removed. The
    // structural invariants — non-empty + unique IDs — are what actually
    // matter, and they catch real regressions (accidental duplicate ids
    // from copy-paste, empty file after a refactor).
    expect(prompts.length).toBeGreaterThan(0);
    const ids = new Set(prompts.map((p) => p.id));
    expect(ids.size).toBe(prompts.length);
  });

  it('every prompt has the required fields: id, title, description, prompt, image', () => {
    const requiredKeys: (keyof Prompt)[] = ['id', 'title', 'description', 'prompt', 'image'];

    for (const p of prompts) {
      for (const key of requiredKeys) {
        expect(p).toHaveProperty(key);
      }
    }
  });

  it('no prompt has empty or undefined required fields', () => {
    for (const p of prompts) {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.prompt).toBeTruthy();
      expect(p.image).toBeTruthy();

      // Also ensure they are strings
      expect(typeof p.id).toBe('string');
      expect(typeof p.title).toBe('string');
      expect(typeof p.description).toBe('string');
      expect(typeof p.prompt).toBe('string');
      // image can be a string (mocked) or a module default
      expect(typeof p.image).toBe('string');
    }
  });

  it('all IDs are unique', () => {
    const ids = prompts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('no ID contains whitespace', () => {
    for (const p of prompts) {
      expect(p.id).not.toMatch(/\s/);
    }
  });
});
