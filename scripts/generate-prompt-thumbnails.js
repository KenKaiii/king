/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate Thumbnail Images for the Prompts Gallery (new prompts only)
 *
 * Generates a JPG thumbnail for every prompt in `promptsToGenerate` below.
 * Output goes to `src/renderer/src/assets/prompts/<id>.jpg`.
 *
 * Usage:
 *   node scripts/generate-prompt-thumbnails.js              # skip existing files
 *   node scripts/generate-prompt-thumbnails.js --force      # regenerate all
 *   node scripts/generate-prompt-thumbnails.js --only id1,id2
 *
 * Env:
 *   KIE_API_KEY   Required. kie.ai API key.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'src/renderer/src/assets/prompts');

const API_KEY = process.env.KIE_API_KEY;
if (!API_KEY) {
  console.error('Error: KIE_API_KEY environment variable is required.');
  console.error('Run with: KIE_API_KEY=your_key node scripts/generate-prompt-thumbnails.js');
  process.exit(1);
}
const BASE_URL = 'https://api.kie.ai';
const MODEL = 'seedream/4.5-text-to-image';
const ASPECT_RATIO = '1:1';

// ---------------------------------------------------------------------------
// New prompts added in this round — text must stay in sync with prompts.ts.
// ---------------------------------------------------------------------------

const promptsToGenerate = [
  // --- Social & Ads ---
  {
    id: 'ig-feed-square',
    prompt: `Ultra-realistic 1:1 square Instagram feed product photograph of the product placed slightly off-center on a soft pastel paper backdrop, shot at 50mm f/4, soft window light from upper left, gentle contact shadow, warm minimal color palette, generous negative space in the top-right for a caption sticker overlay, color-accurate label, no text, no watermark, no logos beyond the product, 2026 social media feed aesthetic, shot ratio 1:1.`,
  },
  {
    id: 'ig-story-vertical',
    prompt: `Ultra-realistic 9:16 vertical Instagram Story photograph of the product centered in the middle third of the frame, tall pastel gradient backdrop, soft directional window light, subtle motion-blur hand reaching in from the right, generous empty space at top (for profile/sticker safe zone) and bottom (for reply bar safe zone), shallow depth of field at f/2.8, 2026 Gen Z story aesthetic, color-accurate product label, no on-image text, shot ratio 9:16.`,
  },
  {
    id: 'ig-carousel-hook',
    prompt: `Hyper-realistic Instagram carousel opening slide of the product shot straight-on against a bold saturated color block background (choose a single vivid hue), dramatic single-source softbox from 45° upper-left, high-contrast shadow anchoring the product, crisp product edges, large clean area at top for a punchy two-word hook overlay, modern editorial feel, shot ratio 4:5, 8K resolution, no text rendered in image.`,
  },
  {
    id: 'tiktok-vertical-hook',
    prompt: `Ultra-realistic 9:16 vertical TikTok-style product photograph of the product tossed slightly mid-air against a vibrant gradient backdrop (punchy duotone — cobalt to magenta), slight motion streak behind product, handheld iPhone-flash look with hard shadow, product sharp and centered at eye-level third, empty top zone for a caption, native social-video aesthetic, authentic slightly-imperfect styling, shot ratio 9:16, 2026 TikTok feed energy.`,
  },
  {
    id: 'fb-meta-ad-cta',
    prompt: `Ultra-realistic 1.91:1 landscape Meta/Facebook ad composition of the product placed in the left third of the frame on a clean warm-neutral surface, soft diffused studio light from upper-left, tidy prop cluster nearby, large clean negative space filling the right two-thirds for a headline and CTA button overlay, color-true product label, shot at 50mm f/5.6, crisp commercial advertising style, shot ratio 1.91:1, no rendered text.`,
  },
  {
    id: 'pinterest-vertical-pin',
    prompt: `Photorealistic 2:3 vertical Pinterest pin composition of the product styled editorially on a linen-draped surface with seasonal botanicals, soft overhead natural light, muted warm palette, product slightly elevated on a small cream pedestal, generous clear area near the top third for a headline overlay, tasteful aspirational home-editorial mood, shot at 35mm f/4, shot ratio 2:3, 8K resolution.`,
  },
  {
    id: 'ad-4x5-headline',
    prompt: `Ultra-realistic 4:5 vertical paid social ad photograph of the product hero-centered in the lower two-thirds on a soft blush-to-peach gradient seamless, studio softbox from upper-left plus warm fill, clean negative space in the top third for a headline overlay, subtle product shadow, crisp color-accurate label, shot at 85mm f/5.6 ISO 100, premium DTC ad look, shot ratio 4:5 --ar 4:5.`,
  },
  {
    id: 'ugc-iphone-look',
    prompt: `Authentic UGC-style iPhone photograph of a hand holding the product close to the camera in a sunlit kitchen, slight sensor noise, mild JPEG crunch, warm on-camera phone color, imperfect composition with a tiny bit of motion blur, overexposed window behind, real-life counter clutter blurred out of focus, completely un-retouched amateur feel, shot ratio 4:5, 2026 influencer-grade UGC aesthetic, no filters, no text.`,
  },
  {
    id: 'daily-5-flatlay',
    prompt: `Hyper-realistic overhead flat-lay composition for a "5 things I use daily" social post — the product as the hero piece plus four complementary everyday items (keys, earbuds case, small notebook, linen pouch) arranged on a warm oat-colored linen background. Even soft natural daylight, tidy minimalist styling, equal spacing, subtle cast shadows, crisp color-accurate product label, shot ratio 1:1, 8K resolution, 2026 lifestyle editorial.`,
  },
  {
    id: 'hero-banner-landscape',
    prompt: `Photorealistic 16:9 landscape hero banner of the product positioned in the left third on a soft tonal set (warm sand surface, blurred architectural backdrop), cinematic diffused side light, long gentle shadow trailing right, expansive clean negative space on the right two-thirds for headline and CTA, modern DTC site banner style, shot at 50mm f/4, shot ratio 16:9, 8K resolution, no rendered text.`,
  },
  {
    id: 'before-after-vertical-ad',
    prompt: `Ultra-realistic 9:16 vertical split-screen ad of the product — top half labeled visually with a dull desaturated "before" scene (muted tones, tired lighting), bottom half a vibrant color-graded "after" scene with the product hero-lit. Clean horizontal divider at the middle, matched perspective in both halves, color-accurate product, polished paid-social creative look, shot ratio 9:16, 8K resolution, no rendered text.`,
  },
  {
    id: 'aspirational-hand-hold',
    prompt: `Photorealistic aspirational lifestyle shot of a hand holding the product up against a softly blurred golden-hour outdoor backdrop, sunbeam flare catching the top edge of the product, warm skin tones, minimal jewelry, shallow depth of field at 85mm f/1.8, color-accurate product label in sharp focus, natural unposed feel, shot ratio 4:5, 8K resolution, 2026 lifestyle ad aesthetic.`,
  },
  {
    id: 'trendy-shelfie-vertical',
    prompt: `Ultra-realistic 9:16 vertical "shelfie" tabletop composition with the product centered on a small ribbed ceramic tray, flanked by a taper candle, a stack of two coffee-table books, and a trailing pothos leaf. Warm bulb lamp light from the right, soft shadows, warm neutral palette, cozy 2026 home-aesthetic mood, shallow depth of field, shot ratio 9:16, 8K resolution, color-true label.`,
  },
  {
    id: 'reel-cover-minimal',
    prompt: `Minimalist 9:16 vertical Instagram Reel cover of the product perfectly centered on a soft single-tone backdrop (warm cream), extremely clean composition, tiny hero product with large surrounding negative space, soft even studio light, subtle contact shadow, precise symmetry for a tap-worthy thumbnail, shot ratio 9:16, 8K resolution, no rendered text, 2026 editorial reel cover style.`,
  },

  // --- Health / Wellness ---
  {
    id: 'supplement-bottle-clinical',
    prompt: `Ultra-realistic clinical product photograph of the product — a supplement bottle — standing on a pure white acrylic surface, a small cluster of capsules arranged in a neat arc beside it. Crisp high-key lighting from a large overhead softbox, subtle soft shadow, color-accurate label in sharp focus, clean trustworthy pharmaceutical aesthetic, shot at 85mm f/8 ISO 100, 8K resolution, premium wellness brand advertising.`,
  },
  {
    id: 'vitamin-gummy-jar-kitchen',
    prompt: `Photorealistic lifestyle product shot of the product — a vitamin gummy jar with the lid off — on a light oak kitchen counter, a few colorful gummies spilled beside it, morning sunlight streaming through a window creating soft warm highlights, a blurred ceramic mug of coffee in the background, shallow depth of field at 50mm f/2.8, warm cheerful wellness mood, color-accurate label, shot ratio 4:5, 8K resolution.`,
  },
  {
    id: 'protein-tub-gym',
    prompt: `Hyper-realistic dramatic product photograph of the product — a protein powder tub — placed on a textured black rubber gym floor, a scoop of powder resting beside it with a small cloud of dust frozen mid-air. Hard directional side light creating long bold shadows, dark moody gradient background, rim light on the tub edge, muscular high-performance aesthetic, color-accurate label, shot at 35mm f/5.6, 8K resolution, premium sports nutrition ad.`,
  },
  {
    id: 'collagen-powder-pastel',
    prompt: `Minimalist product photograph of the product — a collagen powder jar — centered on a soft blush-pink seamless backdrop, a small neat spoonful of fine powder resting on a round ceramic disc beside it. Clean diffused daylight from above, gentle soft shadow, warm pastel palette, calm feminine wellness mood, color-accurate label, shot at 85mm f/5.6 ISO 100, shot ratio 4:5, 8K resolution, premium clean-beauty supplement ad.`,
  },
  {
    id: 'electrolyte-sachet-beach',
    prompt: `Ultra-realistic lifestyle product photograph of the product — an electrolyte sachet — resting on pale golden sand beside a frosty glass of water with fresh lemon and ice. Soft focus turquoise ocean waves in the distant background, warm late-morning sunlight, tiny water droplets on the glass, fresh hydrating summery mood, shot at 50mm f/2.8, shot ratio 4:5, color-accurate label, 8K resolution, premium hydration brand advertising.`,
  },
  {
    id: 'greens-powder-splash',
    prompt: `Hyper-realistic high-speed product photograph of the product — a greens powder tub — with a scoop suspended mid-air releasing a dynamic vivid green powder burst frozen in motion. Fresh spinach and mint leaves scattered nearby, clean white studio backdrop, bright diffused overhead light plus a crisp side rim, ultra-sharp focus on the tub, color-accurate label, shot at 85mm f/8, 8K resolution, premium wellness supplement ad.`,
  },
  {
    id: 'melatonin-bedside-night',
    prompt: `Photorealistic moody lifestyle product photograph of the product — a sleep supplement bottle — on a dark wood nightstand beside a softly lit linen-shaded lamp, a folded book and a small plant in the blurred background. Deep warm amber lamp glow as the only light source, rich shadows, calm restful night-time atmosphere, shallow depth of field at 50mm f/1.8, color-accurate label, shot ratio 4:5, 8K resolution, premium sleep wellness ad.`,
  },
  {
    id: 'omega3-capsules-macro',
    prompt: `Ultra-macro product photograph of the product — an omega-3 supplement bottle — with a small cluster of translucent amber capsules arranged in the foreground catching light so the golden fish-oil inside glows. Clean soft-gradient neutral background, crisp overhead softbox lighting with a subtle warm rim, extreme texture detail on the capsule surface, color-accurate label, shot at 100mm macro f/5.6, 8K resolution, premium wellness brand editorial.`,
  },
  {
    id: 'probiotic-botanical-clean',
    prompt: `Ultra-realistic clean-science product photograph of the product — a probiotic bottle — on a pale sage-green matte surface, fresh botanicals (thyme sprig, a single eucalyptus leaf) and a small clear petri-dish prop arranged nearby. Soft even daylight from above, precise soft shadows, calm modern biotech aesthetic, color-accurate label in sharp focus, shot at 85mm f/5.6 ISO 100, shot ratio 4:5, 8K resolution, premium gut-health brand ad.`,
  },

  // --- Beauty (additional) ---
  {
    id: 'retinol-serum-acrylic',
    prompt: `Ultra-realistic premium beauty product photograph of the product — a retinol serum bottle — standing on a frosted acrylic block, hard directional key light from 45° upper-left casting a crisp long drop shadow across the surface, soft warm fill on the opposite side. Muted peach gradient background, color-accurate amber liquid visible through glass, editorial dermatological aesthetic, shot at 85mm f/8, 8K resolution, 2026 clinical-luxe skincare ad.`,
  },
  {
    id: 'sunscreen-poolside-tropical',
    prompt: `Hyper-realistic sun-drenched product photograph of the product — a sunscreen bottle — resting on a turquoise-tiled pool edge, tiny water droplets beading on the label, soft caustic light reflections from the water dancing on the tile. A folded striped beach towel blurred in the background, bright midday tropical sunlight, color-accurate label sharp in focus, shot at 35mm f/4, shot ratio 4:5, 8K resolution, premium 2026 suncare ad.`,
  },
  {
    id: 'lipstick-duo-editorial',
    prompt: `Ultra-realistic editorial still-life photograph of the product — two luxury lipstick tubes — arranged sculpturally, one standing upright and one laying at a precise diagonal, casting sharp intersecting shadows on a warm taupe textured plaster surface. Hard spotlight from upper-right, deep contrast, rich saturated bullet color visible on one uncapped tube, color-accurate metallic case finish, shot at 100mm macro f/8, 8K resolution, 2026 high-fashion beauty editorial.`,
  },
  {
    id: 'fragrance-dark-smoke',
    prompt: `Cinematic ultra-realistic fragrance product photograph of the product — a luxury perfume bottle with richly colored liquid — centered against a deep black backdrop with wisps of atmospheric smoke curling around it. Strong cold rim lights from left and right defining the glass silhouette, a single warm accent highlight on the cap, glossy reflections, sensual moody aesthetic, color-accurate liquid, shot at 85mm f/5.6, 8K resolution, 2026 premium fragrance campaign.`,
  },
  {
    id: 'mens-grooming-marble',
    prompt: `Photorealistic masculine grooming product photograph of the product on a dark veined marble shelf, a brushed-brass shaving accessory and a small folded dark linen cloth styled nearby. Moody warm overhead light with strong side shadow, restrained luxurious barbershop aesthetic, color-accurate label, crisp reflections on the marble, shot at 50mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium men's grooming brand ad.`,
  },
  {
    id: 'hair-oil-silk-drip',
    prompt: `Ultra-realistic beauty product photograph of the product — a hair oil bottle — tilted slightly with a slow golden viscous drip falling onto a softly flowing champagne-colored silk fabric below, the silk catching the drip and creating a glossy pooled sheen. Warm rim backlight making the oil glow translucent, rich editorial color palette, extreme texture detail, color-accurate label, shot at 100mm macro f/5.6, 8K resolution, 2026 luxury haircare campaign.`,
  },

  // --- Lifestyle (additional) ---
  {
    id: 'tech-wfh-desk',
    prompt: `Photorealistic modern work-from-home lifestyle photograph of the product on a warm walnut desk, a partially blurred laptop, a ceramic pour-over coffee setup, and a small trailing plant styled around it. Soft directional morning window light, warm neutral palette, crisp focus on the product, shallow depth of field at 35mm f/2.8, color-accurate label, 2026 cozy-tech aesthetic, shot ratio 4:5, 8K resolution.`,
  },
  {
    id: 'kitchen-gadget-in-use',
    prompt: `Ultra-realistic lifestyle product photograph of the product — a kitchen gadget — being used by hands (no face visible) mid-prep on a light marble countertop, fresh ingredients (herbs, produce, a wooden board) arranged naturally around it. Bright diffused window light, authentic cooking moment with subtle motion, color-accurate product, shallow depth of field at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium kitchenware brand ad.`,
  },
  {
    id: 'backpack-travel-editorial',
    prompt: `Cinematic editorial travel photograph of the product — a backpack — worn from behind by a person walking down a cobblestone European street at golden hour, no face shown, soft lens flare, warm painterly color grade, crisp texture detail on the pack straps and fabric, shallow depth of field at 35mm f/2.8, color-accurate product, shot ratio 4:5, 8K resolution, 2026 aspirational travel brand campaign.`,
  },

  // --- Cinematic (additional) ---
  {
    id: 'liquid-pour-frozen-splash',
    prompt: `Ultra-cinematic hyper-realistic high-speed product photograph of the product suspended mid-air inside a perfectly frozen cascading liquid pour, crown-shaped droplets exploding around it, liquid ribbon wrapping the product. Dark gradient backdrop, dramatic twin rim lights carving the liquid edges, razor-sharp focus on the product, shot at 100mm macro f/11 with strobe flash freezing motion, 8K resolution, 2026 premium advertising style.`,
  },
  {
    id: 'luxury-watch-volcanic',
    prompt: `Hyper-realistic luxury product photograph of the product — a high-end watch — resting on jagged black volcanic rock, a single hard spotlight from upper-right carving out deep dramatic shadows across the texture. Deep black void background, crisp specular highlights on the watch case and dial, color-accurate dial detail, shot at 100mm macro f/11, 8K resolution, 2026 premium horology campaign.`,
  },
  {
    id: 'earbuds-wet-neon',
    prompt: `Cinematic ultra-realistic product photograph of the product — wireless earbuds in their case — on a wet reflective obsidian surface with colorful neon sign glow (cyan and magenta) reflecting beneath. Thin film of water creating mirror reflections, shallow puddle ripples, moody nighttime tech aesthetic, crisp product edges, color-accurate finish, shot at 50mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium consumer-tech ad.`,
  },

  // --- Food & Drink ---
  {
    id: 'restaurant-hero-overhead',
    prompt: `Ultra-realistic overhead food photograph of the product — a hero plated dish — centered on a dark walnut table, styled with linen napkin, brass cutlery, a sprig of fresh herbs, and a small side ramekin. Moody directional window light from upper-left, rich contrast, color-accurate food textures, glistening highlights on sauce and garnish, shallow depth of field at 50mm f/4, shot ratio 1:1, 8K resolution, 2026 premium restaurant editorial.`,
  },
  {
    id: 'latte-art-macro',
    prompt: `Ultra-macro coffee photograph of the product — a ceramic mug — filled to the brim with a silky rosetta latte art pattern, fine microfoam detail, a single loose coffee bean resting on the saucer. Warm directional window light, soft steam curling above the surface, muted cream and espresso palette, shallow depth of field at 100mm macro f/2.8, shot ratio 4:5, 8K resolution, 2026 specialty-coffee brand editorial.`,
  },
  {
    id: 'cocktail-splash-hero',
    prompt: `Hyper-realistic high-speed beverage photograph of the product — a coupe cocktail glass — with a citrus twist frozen mid-drop creating a sculpted splash crown, tiny droplets suspended in the air around it. Deep amber liquid with crystal-clear ice sphere, dark moody backdrop with rim light sculpting the glass, color-accurate garnish, shot at 100mm macro f/8, 8K resolution, 2026 premium spirits campaign.`,
  },
  {
    id: 'pizza-cheese-pull',
    prompt: `Ultra-realistic action food photograph of the product — a pizza — with a single slice being lifted by a hand (no face visible), a dramatic cheese pull stretching between slice and pie, crisp leopard-spotted crust visible. Dark rustic wood board, warm directional overhead spotlight, steam rising, vibrant color-accurate toppings, shallow depth of field at 50mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium pizzeria ad.`,
  },
  {
    id: 'burger-stack-hero',
    prompt: `Hyper-realistic side-on food photograph of the product — a signature burger stack — with precisely layered patty, melted cheese, crisp lettuce, tomato, and a glossy toasted brioche bun, condiments catching the light. Soft warm backlight creating a subtle glow around edges, neutral warm backdrop, tiny sesame seeds tack-sharp, shallow depth of field at 85mm f/4, shot ratio 1:1, 8K resolution, 2026 premium burger brand campaign.`,
  },
  {
    id: 'dessert-macro-plated',
    prompt: `Ultra-macro dessert photograph of the product — a plated dessert … with glossy chocolate sauce pooling elegantly, fine gold leaf accents, fresh berries glistening, and a dusting of powdered sugar. Dark textured ceramic plate, moody side window light with crisp highlights, color-accurate hues, shallow depth of field at 100mm macro f/4, shot ratio 4:5, 8K resolution, 2026 fine-dining editorial.`,
  },
  {
    id: 'beverage-fridge-condensation',
    prompt: `Ultra-realistic beverage product photograph of the product — a chilled can or bottle — covered in heavy fresh condensation beads, ice cubes and a few frosted droplets scattered around the base. Deep gradient color backdrop matching the brand hue, crisp rim lighting sculpting the product edges, color-accurate label, shot at 85mm f/8 ISO 100, shot ratio 4:5, 8K resolution, 2026 premium beverage campaign.`,
  },
  {
    id: 'chocolate-bar-reveal',
    prompt: `Hyper-realistic macro food photograph of the product — a premium chocolate bar — half-unwrapped from its foil, one square snapped off revealing a clean break edge with visible texture, cocoa nibs and a dusting of cocoa scattered nearby. Warm moody studio light, rich dark backdrop, color-accurate deep brown tones, shallow depth of field at 100mm macro f/4, shot ratio 4:5, 8K resolution, 2026 luxury confection campaign.`,
  },

  // --- Fashion ---
  {
    id: 'sneaker-studio-hero',
    prompt: `Ultra-realistic hero sneaker product photograph of the product — a single sneaker — suspended mid-air at a dynamic 3/4 angle on a bold saturated color backdrop, precise sculpted drop shadow on the ground plane below. Crisp rim lighting carving out silhouette and midsole, color-accurate materials, every stitch and lace detail tack-sharp, shot at 85mm f/11, shot ratio 4:5, 8K resolution, 2026 premium footwear campaign.`,
  },
  {
    id: 'handbag-pedestal-editorial',
    prompt: `Ultra-realistic luxury fashion product photograph of the product — a designer handbag — placed on a round travertine pedestal against a warm peach plaster backdrop. Soft directional window light from the left casting a long painterly shadow, hardware highlights catching the light, color-accurate leather texture in crisp focus, shot at 85mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium luxury fashion editorial.`,
  },
  {
    id: 'apparel-flatlay-editorial',
    prompt: `Ultra-realistic overhead editorial flat-lay of the product styled with a complete curated outfit — folded knitwear, denim, a leather belt, small gold jewelry, and a pair of minimalist shoes — arranged on warm stone-colored textured paper. Soft even daylight, precise spacing, subtle cast shadows, color-accurate fabric textures, shot at 35mm f/8, shot ratio 1:1, 8K resolution, 2026 premium fashion editorial.`,
  },
  {
    id: 'model-jacket-no-face',
    prompt: `Photorealistic fashion product photograph of the product — a tailored jacket — worn on a model shown from the shoulders to hips, no face visible, shot against a concrete grey studio cyc. Soft cinematic side light with gentle shadow falloff, natural fabric drape, color-accurate textile detail, shallow depth of field at 85mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium apparel editorial campaign.`,
  },
  {
    id: 'jewelry-velvet-hero',
    prompt: `Ultra-macro luxury jewelry product photograph of the product — a fine jewelry piece — arranged elegantly on a deep emerald velvet surface, soft pin-lights carving out controlled specular highlights on every stone and metal facet. Rich color palette, mirror-clean gem detail, moody darker backdrop, shot at 100mm macro f/11 focus-stacked, shot ratio 1:1, 8K resolution, 2026 premium fine-jewelry editorial.`,
  },
  {
    id: 'sunglasses-glow-studio',
    prompt: `Ultra-realistic eyewear product photograph of the product — sunglasses — floating against a punchy gradient backdrop (sunset orange to magenta), soft colored glow radiating behind the frame. Crisp rim light sculpting the frame and lens edges, color-accurate lens tint, fine frame texture detail, shot at 100mm macro f/8, shot ratio 4:5, 8K resolution, 2026 premium eyewear campaign.`,
  },
  {
    id: 'watch-dial-macro-luxury',
    prompt: `Ultra-macro luxury horology photograph of the product — a fine watch — shot straight-down on a slate-grey brushed-metal surface, dial perfectly centered, hands aligned to 10:10. Precise focus-stacked crispness across dial, indices, and bezel, controlled specular highlights on the case, deep shadows around the edges, color-accurate dial tones, shot at 100mm macro f/16, shot ratio 1:1, 8K resolution, 2026 premium watch brand editorial.`,
  },
  {
    id: 'hat-wall-minimalist',
    prompt: `Photorealistic minimalist fashion product photograph of the product — a hat — hung on a simple brass peg against a warm cream plaster wall with visible trowel texture. Soft raking daylight from the left casting a long gentle shadow, subtle natural fabric texture, color-accurate tones, shot at 50mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium apparel brand editorial.`,
  },
  {
    id: 'sneaker-street-action',
    prompt: `Ultra-realistic street fashion photograph of the product — sneakers — captured mid-stride on wet city pavement, the stepping shoe sharp and the trailing shoe slightly motion-blurred, reflections on the wet surface catching neon signage glow. Moody evening lighting with cold ambient and warm accent, color-accurate materials, crisp tread detail, shot at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium streetwear campaign.`,
  },

  // --- Home & Decor ---
  {
    id: 'candle-ambient-living',
    prompt: `Ultra-realistic home decor product photograph of the product — a lit candle — on a stone coffee table, warm flickering flame, softly blurred linen sofa and bouclé throw behind. Evening ambient light with a golden bulb glow, deep cozy shadows, color-accurate vessel finish, shallow depth of field at 50mm f/1.8, shot ratio 4:5, 8K resolution, 2026 premium home-fragrance brand editorial.`,
  },
  {
    id: 'throw-pillow-sofa-styled',
    prompt: `Photorealistic home decor lifestyle photograph of the product — a throw pillow — styled on a natural linen sofa with a thick knit throw casually draped nearby, a small stack of coffee-table books on the side. Soft morning window light from the right, warm neutral palette, crisp color-accurate fabric texture, shallow depth of field at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium home-textile brand ad.`,
  },
  {
    id: 'rug-modern-living-room',
    prompt: `Ultra-realistic wide interior photograph of the product — an area rug — laid in a modern living room with a sculptural bouclé chair, a small ceramic side table, and a tall arched window on the right casting long architectural light streaks across the rug. Warm neutral palette, crisp weave texture detail, color-accurate pile, shot at 24mm f/5.6, shot ratio 16:9, 8K resolution, 2026 premium home-decor brand editorial.`,
  },
  {
    id: 'vase-flowers-still-life',
    prompt: `Photorealistic editorial still-life photograph of the product — a ceramic vase — holding a loose, asymmetric arrangement of seasonal florals and branches on a warm plaster-textured backdrop. Soft directional window light from the left, long painterly shadow, color-accurate glaze and floral tones, shallow depth of field at 85mm f/4, shot ratio 4:5, 8K resolution, 2026 premium home-goods brand editorial.`,
  },
  {
    id: 'tableware-set-dining',
    prompt: `Ultra-realistic overhead product photograph of the product — a ceramic tableware set — styled elegantly on a wrinkled natural linen tablecloth with brass flatware, woven placemats, and a small floral centerpiece. Soft diffused overhead daylight, precise spacing, color-accurate glaze tones, subtle textural highlights, shot at 35mm f/8, shot ratio 1:1, 8K resolution, 2026 premium tabletop brand editorial.`,
  },
  {
    id: 'bedding-minimal-bedroom',
    prompt: `Photorealistic interior lifestyle photograph of the product — a bedding set — layered on a platform bed in a serene minimalist bedroom, softly wrinkled sheets and neatly folded throw at the foot, a single wooden stool with a book and ceramic cup nearby. Soft morning light filtering through linen curtains, warm neutral palette, crisp fabric texture, shot at 35mm f/4, shot ratio 4:5, 8K resolution, 2026 premium bedding brand editorial.`,
  },

  // --- Pet ---
  {
    id: 'pet-food-bowl-kitchen',
    prompt: `Ultra-realistic pet lifestyle photograph of the product — a pet food kibble or wet food — freshly scooped into a ceramic bowl on a warm oak floor, a soft-focus dog or cat partially visible in the background approaching the bowl. Warm morning kitchen light, cozy inviting mood, color-accurate food texture and bowl finish, shallow depth of field at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium pet-food brand campaign.`,
  },
  {
    id: 'pet-treat-pouch-studio',
    prompt: `Photorealistic studio product photograph of the product — a pet treat pouch — standing upright on a soft pastel backdrop with a small neat pile of treats scattered in front, a plush toy bone or tennis ball styled nearby. Soft diffused lighting with a warm rim, color-accurate packaging, tack-sharp treat texture, shot at 85mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium pet-treat brand ad.`,
  },
  {
    id: 'pet-collar-flatlay',
    prompt: `Ultra-realistic overhead product photograph of the product — a pet collar and matching leash — arranged in a clean loose curve on a warm oat-colored linen surface, a small brass ID tag, a tiny sprig of greenery, and a rolled leather lead styled nearby. Soft even daylight, subtle cast shadows, color-accurate materials, shot at 50mm f/8, shot ratio 1:1, 8K resolution, 2026 premium pet-accessory brand editorial.`,
  },

  // --- Concept / Scroll-Stopping ---
  {
    id: 'jelly-cubes-squeeze',
    prompt: `Photorealistic commercial product shot of the product centered and gently pressed between two oversized glossy wobbly jelly cubes in soft pastel hues (mint green and blush pink). Jelly cubes compress slightly against the product with a tactile squish, glossy translucent surfaces catching studio light with subtle internal highlights. Ultra-clean bright studio beauty lighting, smooth specular highlights, soft contact shadow beneath. Clean pastel gradient background, minimal distraction-free composition, playful premium social-media aesthetic, 8K resolution, shot ratio 1:1, 2026 scroll-stopping ad energy.`,
  },
  {
    id: 'whipped-cream-dollop',
    prompt: `Hyper-realistic beauty product photograph of the product rising playfully out of the center of a perfect swirl of glossy whipped cream, a single glossy red cherry resting on top beside it. Whipped cream texture tack-sharp with visible peaks and creamy folds, soft diffused overhead studio light, subtle reflections on the product, clean pale-pink pastel gradient background, airy indulgent feel, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium playful product advertising.`,
  },
  {
    id: 'balloon-trio-float',
    prompt: `Ultra-realistic playful commercial product shot of the product suspended mid-air, lifted by three glossy helium balloons in soft pastel hues (peach, lilac, mint) with delicate thin strings trailing down. Clean pastel sky-blue gradient background, bright even studio lighting, crisp specular highlights on balloon surfaces, color-accurate product label, sharp product focus, shot ratio 1:1, 8K resolution, 2026 premium social-media product ad.`,
  },
  {
    id: 'macaron-stack-pedestal',
    prompt: `Photorealistic beauty product photograph of the product standing elegantly on top of a precise stack of five pastel-colored French macarons (rose, pistachio, vanilla, lavender, peach). Macarons show tack-sharp almond texture and delicate ruffled feet, clean pale-pink gradient background, bright diffused overhead studio light, soft even shadow beneath the stack, color-accurate product label, shot ratio 1:1, 8K resolution, 2026 premium feminine social advertising.`,
  },
  {
    id: 'pastel-bubble-wrap-pop',
    prompt: `Ultra-realistic playful product photograph of the product placed flat on a sheet of oversized pastel-tinted bubble wrap (soft lilac-to-mint gradient), a few bubbles clearly popped flat around the product while the others remain plump. Bright clean studio lighting creating crisp highlights on every bubble, subtle shadow under the product, minimal distraction-free composition, color-accurate label, shot ratio 1:1, 8K resolution, 2026 scroll-stopping social-media ad.`,
  },
  {
    id: 'sprinkles-burst-cloud',
    prompt: `Hyper-realistic high-speed product photograph of the product centered in the frame with a vibrant cloud of pastel-colored sprinkles frozen mid-explosion around it, individual sprinkles suspended in the air in a playful expressive burst. Clean white-to-blush gradient background, bright crisp studio lighting with soft side rim, sharp focus on product, tack-sharp sprinkle detail, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium playful product campaign.`,
  },
  {
    id: 'marshmallow-nest',
    prompt: `Ultra-realistic beauty product photograph of the product nestled into a soft mound of oversized pastel marshmallows in pale pink, white, and mint green. Plush pillowy surfaces with tack-sharp sugar-dusted texture, bright clean studio lighting with gentle shadow beneath, airy cozy-yet-premium feel, clean pastel gradient background, color-accurate label, shot ratio 1:1, 8K resolution, 2026 playful premium social advertising.`,
  },
  {
    id: 'latex-glove-hold',
    prompt: `Photorealistic commercial product shot of a single glossy inflated pastel-pink latex glove holding the product upright in a playful cupping gesture, each fingertip slightly rounded with a subtle highlight. Clean pastel peach gradient background, bright even studio lighting, crisp specular highlights on the glossy glove surface, sharp color-accurate product label, minimal composition with strong single-concept focus, shot ratio 1:1, 8K resolution, 2026 scroll-stopping social beauty ad.`,
  },
  {
    id: 'confetti-paper-rain',
    prompt: `Ultra-realistic high-speed product photograph of the product placed centrally with a celebratory cascade of pastel paper confetti falling and frozen mid-air around it — soft pinks, mints, creams, and gold flecks. Clean pastel gradient backdrop, bright crisp studio lighting with soft side rim, tack-sharp edges on every confetti piece, sharp focus on product, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium playful social-media product ad.`,
  },
  {
    id: 'soap-bubble-sphere',
    prompt: `Hyper-realistic beauty product photograph of the product suspended inside a perfectly round translucent soap bubble, iridescent rainbow-tinted swirls dancing across the bubble surface. A few smaller bubbles floating nearby, clean pastel sky gradient background, bright clean studio lighting, razor-sharp focus on product through the bubble with subtle refraction, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium dreamy product ad.`,
  },
  {
    id: 'silk-ribbon-twirl',
    prompt: `Photorealistic luxury product photograph of the product centered with two or three glossy pastel silk ribbons (blush pink, champagne, pale lilac) gracefully twirling and swirling around it in mid-air, captured frozen in elegant motion. Clean pastel cream gradient background, soft diffused studio lighting with subtle rim light, tack-sharp ribbon sheen, color-accurate product label, shot ratio 1:1, 8K resolution, 2026 premium feminine beauty editorial.`,
  },
  {
    id: 'melted-wax-pool-dip',
    prompt: `Ultra-realistic commercial product shot of the lower third of the product submerged in a glossy pool of melted pastel-pink wax, with smooth wax drips trailing down its sides and frozen mid-fall. Clean pastel cream backdrop, bright clean studio lighting, sharp specular highlights on the wax surface, tack-sharp drip detail, color-accurate product label sharp above the wax line, shot ratio 1:1, 8K resolution, 2026 playful premium beauty advertising.`,
  },
  {
    id: 'tulle-veil-drape',
    prompt: `Photorealistic editorial product photograph of the product with a soft billowing layer of pale pink tulle gently draped and lifted above it, catching the light and creating delicate organic folds around the product. Clean pastel ivory background, soft diffused studio lighting with a warm rim, the product sharp and centered beneath the sheer fabric, color-accurate label, airy romantic feel, shot ratio 1:1, 8K resolution, 2026 premium feminine beauty ad.`,
  },
  {
    id: 'paint-swatch-halo',
    prompt: `Ultra-realistic overhead product photograph of the product placed precisely in the center of a tidy circular halo of thick glossy pastel paint dabs in a gradient of colors (blush, peach, mint, lavender, cream) on a clean white surface. Bright clean studio lighting from above, tack-sharp paint texture with visible brushstroke peaks, subtle soft shadow under product, color-accurate label, shot ratio 1:1, 8K resolution, 2026 creative colorful social-media product ad.`,
  },
  {
    id: 'memory-foam-cradle',
    prompt: `Photorealistic beauty product photograph of the product pressed gently into a soft pastel-pink memory-foam cushion, the foam molded perfectly around the product base in a clean shallow crater. Bright clean studio lighting from above, tack-sharp foam surface texture, subtle soft shadow, airy weightless premium feel, clean pastel gradient background, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium cushion-soft skincare ad.`,
  },
];

// ---------------------------------------------------------------------------
// kie.ai API
// ---------------------------------------------------------------------------

async function createTask(prompt) {
  const response = await fetch(`${BASE_URL}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: { prompt, aspect_ratio: ASPECT_RATIO, quality: 'high' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`createTask failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data?.taskId || data.taskId;
}

async function getTaskResult(taskId) {
  const response = await fetch(`${BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  });
  const json = await response.json();
  return json.data || json;
}

async function waitForTask(taskId, maxAttempts = 120, intervalMs = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getTaskResult(taskId);
    if (result.state === 'success') {
      if (result.resultJson) {
        const parsed = JSON.parse(result.resultJson);
        return parsed.resultUrls?.[0];
      }
      return null;
    }
    if (result.state === 'failed' || result.state === 'fail') {
      throw new Error(`Task failed: ${result.failMsg || 'Unknown error'}`);
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Task timed out');
}

async function downloadImage(url, filename) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
}

async function generateOne({ id, prompt }) {
  const filename = `${id}.jpg`;
  console.log(`\nGenerating: ${id}`);
  console.log(`  Prompt: ${prompt.substring(0, 72).replace(/\s+/g, ' ')}...`);
  try {
    const taskId = await createTask(prompt);
    const url = await waitForTask(taskId);
    process.stdout.write('\n');
    if (!url) throw new Error('No image URL returned');
    await downloadImage(url, filename);
    console.log(`  Saved: ${filename}`);
    return { success: true, id, filename };
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return { success: false, id, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function toCamelCase(id) {
  return id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function printWiringHelp(successful) {
  if (successful.length === 0) return;
  console.log('\n' + '='.repeat(60));
  console.log('WIRE INTO prompts.ts');
  console.log('='.repeat(60));
  console.log('\n// 1. Add these imports near the top of prompts.ts:\n');
  for (const s of successful) {
    console.log(`import ${toCamelCase(s.id)} from '@/assets/prompts/${s.id}.jpg';`);
  }
  console.log(
    "\n// 2. Add `image: <camelCaseName>` to the matching rawPrompts entry for each id.",
  );
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const force = args.has('--force');
  let onlyIds = null;
  const onlyFlagIdx = process.argv.indexOf('--only');
  if (onlyFlagIdx !== -1 && process.argv[onlyFlagIdx + 1]) {
    onlyIds = new Set(process.argv[onlyFlagIdx + 1].split(',').map((s) => s.trim()));
  }

  console.log('='.repeat(60));
  console.log('Prompt Thumbnail Generator (kie.ai · seedream 4.5)');
  console.log('='.repeat(60));

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let toGenerate = promptsToGenerate;
  if (onlyIds) {
    toGenerate = toGenerate.filter((p) => onlyIds.has(p.id));
    console.log(`\n--only filter: ${toGenerate.length} selected`);
  } else if (!force) {
    toGenerate = toGenerate.filter(
      (p) => !fs.existsSync(path.join(OUTPUT_DIR, `${p.id}.jpg`)),
    );
    console.log(
      `\n${promptsToGenerate.length - toGenerate.length} already exist on disk (use --force to regenerate)`,
    );
  }

  console.log(`Output dir: ${OUTPUT_DIR}`);
  console.log(`To generate: ${toGenerate.length}`);

  if (toGenerate.length === 0) {
    console.log('\nNothing to generate. Done.');
    return;
  }

  const results = [];
  for (let i = 0; i < toGenerate.length; i++) {
    console.log(`\n[${i + 1}/${toGenerate.length}]`);
    results.push(await generateOne(toGenerate[i]));
    if (i < toGenerate.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('\n' + '='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nSuccessful: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }

  const logPath = path.join(OUTPUT_DIR, 'generation-log.json');
  fs.writeFileSync(
    logPath,
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
  );
  console.log(`\nLog saved: ${logPath}`);

  printWiringHelp(successful);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
