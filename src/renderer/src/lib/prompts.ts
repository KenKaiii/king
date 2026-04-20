export type PromptCategory =
  | 'packshot'
  | 'lifestyle'
  | 'beauty'
  | 'health'
  | 'food'
  | 'fashion'
  | 'home'
  | 'pet'
  | 'social'
  | 'cinematic'
  | 'nature';

export interface PromptCategoryDef {
  id: PromptCategory | 'all';
  label: string;
}

export const promptCategories: PromptCategoryDef[] = [
  { id: 'all', label: 'All' },
  { id: 'packshot', label: 'Packshot' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'health', label: 'Health' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Home' },
  { id: 'pet', label: 'Pet' },
  { id: 'social', label: 'Social & Ads' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'nature', label: 'Nature' },
];

export interface Prompt {
  id: string;
  title: string;
  description: string;
  image?: string;
  prompt: string;
  category: PromptCategory;
}

// Import all product prompt images
import productMirrorSelfie from '@/assets/prompts/product-mirror-selfie.jpg';
import amazonPackshot from '@/assets/prompts/amazon-packshot.jpg';
import footwearPackshot from '@/assets/prompts/footwear-packshot.jpg';
import apparelFlatlay from '@/assets/prompts/apparel-flatlay.jpg';
import beautyBottle from '@/assets/prompts/beauty-bottle.jpg';
import skincareJar from '@/assets/prompts/skincare-jar.jpg';
import retailBox from '@/assets/prompts/retail-box.jpg';
import ceramicMug from '@/assets/prompts/ceramic-mug.jpg';
import backpackPackshot from '@/assets/prompts/backpack-packshot.jpg';
import steelBottle from '@/assets/prompts/steel-bottle.jpg';
import toyFigurine from '@/assets/prompts/toy-figurine.jpg';
import headphonesDesk from '@/assets/prompts/headphones-desk.jpg';
import shoePavement from '@/assets/prompts/shoe-pavement.jpg';
import skincareBathroom from '@/assets/prompts/skincare-bathroom.jpg';
import coffeeMugKitchen from '@/assets/prompts/coffee-mug-kitchen.jpg';
import backpackHook from '@/assets/prompts/backpack-hook.jpg';
import knifeCuttingBoard from '@/assets/prompts/knife-cutting-board.jpg';
import yogaMatStudio from '@/assets/prompts/yoga-mat-studio.jpg';
import watchWrist from '@/assets/prompts/watch-wrist.jpg';
import sunglassesTowel from '@/assets/prompts/sunglasses-towel.jpg';
import bottleFridge from '@/assets/prompts/bottle-fridge.jpg';
import jewelryDiffusion from '@/assets/prompts/jewelry-diffusion.jpg';
import glassBottleBacklit from '@/assets/prompts/glass-bottle-backlit.jpg';
import textileMacro from '@/assets/prompts/textile-macro.jpg';
import whiteOnWhite from '@/assets/prompts/white-on-white.jpg';
import cosmeticsSwatches from '@/assets/prompts/cosmetics-swatches.jpg';
import beverageSplashExplosion from '@/assets/prompts/beverage-splash-explosion.jpg';
import fruitSplashProduct from '@/assets/prompts/fruit-splash-product.jpg';
import coffeePourCommercial from '@/assets/prompts/coffee-pour-commercial.jpg';
import productLevitation from '@/assets/prompts/product-levitation.jpg';
import ingredientExplosion from '@/assets/prompts/ingredient-explosion.jpg';
import floatingLuxury from '@/assets/prompts/floating-luxury.jpg';
import luxuryPerfumeEditorial from '@/assets/prompts/luxury-perfume-editorial.jpg';
import premiumSerumMacro from '@/assets/prompts/premium-serum-macro.jpg';
import luxuryFlatLay from '@/assets/prompts/luxury-flat-lay.jpg';
import marblePedestal from '@/assets/prompts/marble-pedestal.jpg';
import handHeldBeauty from '@/assets/prompts/hand-held-beauty.jpg';
import skincareRoutineFlatlay from '@/assets/prompts/skincare-routine-flatlay.jpg';
import cosmeticsWaterFloat from '@/assets/prompts/cosmetics-water-float.jpg';
import beautyGlowShot from '@/assets/prompts/beauty-glow-shot.jpg';
import forestFloorProduct from '@/assets/prompts/forest-floor-product.jpg';
import botanicalGarden from '@/assets/prompts/botanical-garden.jpg';
import fantasyMeadow from '@/assets/prompts/fantasy-meadow.jpg';
import plushFabricRender from '@/assets/prompts/plush-fabric-render.jpg';
import chromePrismatic from '@/assets/prompts/chrome-prismatic.jpg';
import frostedGlassProduct from '@/assets/prompts/frosted-glass-product.jpg';
import ninePanelProductGrid from '@/assets/prompts/nine-panel-product-grid.jpg';
import beforeAfterSplit from '@/assets/prompts/before-after-split.jpg';
import summerVibesProduct from '@/assets/prompts/summer-vibes-product.jpg';
import cozyWinterProduct from '@/assets/prompts/cozy-winter-product.jpg';
import springFreshProduct from '@/assets/prompts/spring-fresh-product.jpg';
import serumDropperMacro from '@/assets/prompts/serum-dropper-macro.jpg';
import creamJarTextureSwirl from '@/assets/prompts/cream-jar-texture-swirl.jpg';
import skincareWaterStone from '@/assets/prompts/skincare-water-stone.jpg';
import skincareScrubExplosion from '@/assets/prompts/skincare-scrub-explosion.jpg';
import faceMaskSqueeze from '@/assets/prompts/face-mask-squeeze.jpg';
import moisturizerDewySkin from '@/assets/prompts/moisturizer-dewy-skin.jpg';
import skincareVanityShelfie from '@/assets/prompts/skincare-vanity-shelfie.jpg';
import lipstickBulletMacro from '@/assets/prompts/lipstick-bullet-macro.jpg';
import foundationSwatchSkin from '@/assets/prompts/foundation-swatch-skin.jpg';
import eyeshadowPaletteScatter from '@/assets/prompts/eyeshadow-palette-scatter.jpg';
import mascaraWandCloseup from '@/assets/prompts/mascara-wand-closeup.jpg';
import blushCompactShatter from '@/assets/prompts/blush-compact-shatter.jpg';
import makeupBrushPowderBurst from '@/assets/prompts/makeup-brush-powder-burst.jpg';
import lipGlossDrip from '@/assets/prompts/lip-gloss-drip.jpg';
import perfumeDarkWoody from '@/assets/prompts/perfume-dark-woody.jpg';
import perfumeFloralPetals from '@/assets/prompts/perfume-floral-petals.jpg';
import perfumeMeadowFantasy from '@/assets/prompts/perfume-meadow-fantasy.jpg';
import perfumeMistSpray from '@/assets/prompts/perfume-mist-spray.jpg';
import shampooPourSilk from '@/assets/prompts/shampoo-pour-silk.jpg';
import bodyOilGoldenPour from '@/assets/prompts/body-oil-golden-pour.jpg';
import bathBombFizz from '@/assets/prompts/bath-bomb-fizz.jpg';
import nailPolishDrip from '@/assets/prompts/nail-polish-drip.jpg';
import nailPolishSpillArt from '@/assets/prompts/nail-polish-spill-art.jpg';
import jewelryOnSkin from '@/assets/prompts/jewelry-on-skin.jpg';
import beautyBathroomSteam from '@/assets/prompts/beauty-bathroom-steam.jpg';
import beautyHandApply from '@/assets/prompts/beauty-hand-apply.jpg';
import beautyMirrorReflection from '@/assets/prompts/beauty-mirror-reflection.jpg';
import beautySilkFabric from '@/assets/prompts/beauty-silk-fabric.jpg';
import beautyIceCold from '@/assets/prompts/beauty-ice-cold.jpg';
import beautyCitrusSplash from '@/assets/prompts/beauty-citrus-splash.jpg';
import beautyHoneyDrizzle from '@/assets/prompts/beauty-honey-drizzle.jpg';
import beautyRosePetalsBath from '@/assets/prompts/beauty-rose-petals-bath.jpg';
import beautyCottonCloud from '@/assets/prompts/beauty-cotton-cloud.jpg';
import beautyAloeGel from '@/assets/prompts/beauty-aloe-gel.jpg';
import igFeedSquare from '@/assets/prompts/ig-feed-square.jpg';
import igStoryVertical from '@/assets/prompts/ig-story-vertical.jpg';
import igCarouselHook from '@/assets/prompts/ig-carousel-hook.jpg';
import tiktokVerticalHook from '@/assets/prompts/tiktok-vertical-hook.jpg';
import fbMetaAdCta from '@/assets/prompts/fb-meta-ad-cta.jpg';
import pinterestVerticalPin from '@/assets/prompts/pinterest-vertical-pin.jpg';
import ad4x5Headline from '@/assets/prompts/ad-4x5-headline.jpg';
import ugcIphoneLook from '@/assets/prompts/ugc-iphone-look.jpg';
import daily5Flatlay from '@/assets/prompts/daily-5-flatlay.jpg';
import heroBannerLandscape from '@/assets/prompts/hero-banner-landscape.jpg';
import beforeAfterVerticalAd from '@/assets/prompts/before-after-vertical-ad.jpg';
import aspirationalHandHold from '@/assets/prompts/aspirational-hand-hold.jpg';
import trendyShelfieVertical from '@/assets/prompts/trendy-shelfie-vertical.jpg';
import reelCoverMinimal from '@/assets/prompts/reel-cover-minimal.jpg';
import supplementBottleClinical from '@/assets/prompts/supplement-bottle-clinical.jpg';
import vitaminGummyJarKitchen from '@/assets/prompts/vitamin-gummy-jar-kitchen.jpg';
import proteinTubGym from '@/assets/prompts/protein-tub-gym.jpg';
import collagenPowderPastel from '@/assets/prompts/collagen-powder-pastel.jpg';
import electrolyteSachetBeach from '@/assets/prompts/electrolyte-sachet-beach.jpg';
import greensPowderSplash from '@/assets/prompts/greens-powder-splash.jpg';
import melatoninBedsideNight from '@/assets/prompts/melatonin-bedside-night.jpg';
import omega3CapsulesMacro from '@/assets/prompts/omega3-capsules-macro.jpg';
import probioticBotanicalClean from '@/assets/prompts/probiotic-botanical-clean.jpg';
import retinolSerumAcrylic from '@/assets/prompts/retinol-serum-acrylic.jpg';
import sunscreenPoolsideTropical from '@/assets/prompts/sunscreen-poolside-tropical.jpg';
import lipstickDuoEditorial from '@/assets/prompts/lipstick-duo-editorial.jpg';
import fragranceDarkSmoke from '@/assets/prompts/fragrance-dark-smoke.jpg';
import mensGroomingMarble from '@/assets/prompts/mens-grooming-marble.jpg';
import hairOilSilkDrip from '@/assets/prompts/hair-oil-silk-drip.jpg';
import techWfhDesk from '@/assets/prompts/tech-wfh-desk.jpg';
import kitchenGadgetInUse from '@/assets/prompts/kitchen-gadget-in-use.jpg';
import backpackTravelEditorial from '@/assets/prompts/backpack-travel-editorial.jpg';
import liquidPourFrozenSplash from '@/assets/prompts/liquid-pour-frozen-splash.jpg';
import luxuryWatchVolcanic from '@/assets/prompts/luxury-watch-volcanic.jpg';
import earbudsWetNeon from '@/assets/prompts/earbuds-wet-neon.jpg';
import restaurantHeroOverhead from '@/assets/prompts/restaurant-hero-overhead.jpg';
import latteArtMacro from '@/assets/prompts/latte-art-macro.jpg';
import cocktailSplashHero from '@/assets/prompts/cocktail-splash-hero.jpg';
import pizzaCheesePull from '@/assets/prompts/pizza-cheese-pull.jpg';
import burgerStackHero from '@/assets/prompts/burger-stack-hero.jpg';
import dessertMacroPlated from '@/assets/prompts/dessert-macro-plated.jpg';
import beverageFridgeCondensation from '@/assets/prompts/beverage-fridge-condensation.jpg';
import chocolateBarReveal from '@/assets/prompts/chocolate-bar-reveal.jpg';
import sneakerStudioHero from '@/assets/prompts/sneaker-studio-hero.jpg';
import handbagPedestalEditorial from '@/assets/prompts/handbag-pedestal-editorial.jpg';
import apparelFlatlayEditorial from '@/assets/prompts/apparel-flatlay-editorial.jpg';
import modelJacketNoFace from '@/assets/prompts/model-jacket-no-face.jpg';
import jewelryVelvetHero from '@/assets/prompts/jewelry-velvet-hero.jpg';
import sunglassesGlowStudio from '@/assets/prompts/sunglasses-glow-studio.jpg';
import watchDialMacroLuxury from '@/assets/prompts/watch-dial-macro-luxury.jpg';
import hatWallMinimalist from '@/assets/prompts/hat-wall-minimalist.jpg';
import sneakerStreetAction from '@/assets/prompts/sneaker-street-action.jpg';
import candleAmbientLiving from '@/assets/prompts/candle-ambient-living.jpg';
import throwPillowSofaStyled from '@/assets/prompts/throw-pillow-sofa-styled.jpg';
import rugModernLivingRoom from '@/assets/prompts/rug-modern-living-room.jpg';
import vaseFlowersStillLife from '@/assets/prompts/vase-flowers-still-life.jpg';
import tablewareSetDining from '@/assets/prompts/tableware-set-dining.jpg';
import beddingMinimalBedroom from '@/assets/prompts/bedding-minimal-bedroom.jpg';
import petFoodBowlKitchen from '@/assets/prompts/pet-food-bowl-kitchen.jpg';
import petTreatPouchStudio from '@/assets/prompts/pet-treat-pouch-studio.jpg';
import petCollarFlatlay from '@/assets/prompts/pet-collar-flatlay.jpg';
import jellyCubesSqueeze from '@/assets/prompts/jelly-cubes-squeeze.jpg';
import whippedCreamDollop from '@/assets/prompts/whipped-cream-dollop.jpg';
import balloonTrioFloat from '@/assets/prompts/balloon-trio-float.jpg';
import macaronStackPedestal from '@/assets/prompts/macaron-stack-pedestal.jpg';
import pastelBubbleWrapPop from '@/assets/prompts/pastel-bubble-wrap-pop.jpg';
import sprinklesBurstCloud from '@/assets/prompts/sprinkles-burst-cloud.jpg';
import marshmallowNest from '@/assets/prompts/marshmallow-nest.jpg';
import latexGloveHold from '@/assets/prompts/latex-glove-hold.jpg';
import confettiPaperRain from '@/assets/prompts/confetti-paper-rain.jpg';
import soapBubbleSphere from '@/assets/prompts/soap-bubble-sphere.jpg';
import silkRibbonTwirl from '@/assets/prompts/silk-ribbon-twirl.jpg';
import meltedWaxPoolDip from '@/assets/prompts/melted-wax-pool-dip.jpg';
import tulleVeilDrape from '@/assets/prompts/tulle-veil-drape.jpg';
import paintSwatchHalo from '@/assets/prompts/paint-swatch-halo.jpg';
import memoryFoamCradle from '@/assets/prompts/memory-foam-cradle.jpg';

const rawPrompts: Omit<Prompt, 'category'>[] = [
  // Amazon Main Image (White Seamless)
  {
    id: 'product-mirror-selfie',
    title: 'Product Selfie',
    description: 'Realistic mirror selfie holding a product',
    image: productMirrorSelfie,
    prompt: `Create a hyper-realistic mirror selfie of a person holding the product in one hand. Use natural bathroom lighting with a believable handheld phone reflection in the mirror. Keep the subject's exact facial features.`,
  },
  {
    id: 'amazon-packshot',
    title: 'Amazon Packshot',
    description: 'Clean white background product shot',
    image: amazonPackshot,
    prompt: `Ultra-realistic studio photograph of the product on a pure white seamless background, centered, fills ~85–90% of frame, 85mm prime look, f/8 sharpness, ISO 100, softbox high-key lighting, gentle contact shadow under product, natural colors, no props, no text, no logos, no watermark.`,
  },
  {
    id: 'footwear-packshot',
    title: 'Footwear Shot',
    description: 'Single shoe 3/4 angle on white',
    image: footwearPackshot,
    prompt: `Photorealistic packshot of the product at a 3/4 angle on white seamless, high-key diffused light, crisp edge detail, subtle ground shadow, product centered and fills ~85–90%, no extras.`,
  },
  {
    id: 'apparel-flatlay',
    title: 'Apparel Flat Lay',
    description: 'Neatly folded garment on white',
    image: apparelFlatlay,
    prompt: `Realistic flat-lay of the product on a pure white background, high-key light tent softness, accurate texture, crease minimized, centered, fills ~85%, no tags or props.`,
  },
  {
    id: 'beauty-bottle',
    title: 'Beauty Bottle',
    description: 'Pump/dropper bottle studio shot',
    image: beautyBottle,
    prompt: `Studio packshot of the product on white seamless, large diffused softbox overhead + front fill, controlled specular highlights, readable label, no glare, natural color, centered, fills ~85–90%, no text overlay or props.`,
  },
  {
    id: 'skincare-jar',
    title: 'Skincare Jar',
    description: 'Cream jar with lid clarity',
    image: skincareJar,
    prompt: `Photorealistic packshot of the product on white seamless, soft even lighting, micro-contrast for embossed details, gentle contact shadow, centered, fills ~85–90%, no surrounding props.`,
  },
  {
    id: 'retail-box',
    title: 'Retail Box',
    description: 'Front-facing product box shot',
    image: retailBox,
    prompt: `Front-facing product on a pure white background, high-key studio light free of edge spill, straightened perspective, sharp detail, no added graphics, centered, fills ~85–90%.`,
  },
  {
    id: 'ceramic-mug',
    title: 'Ceramic Mug',
    description: 'Clean mug with ceramic gloss',
    image: ceramicMug,
    prompt: `Photorealistic product on white seamless, clean edges, accurate surface finish with soft speculars, subtle contact shadow, centered, fills ~85–90%, no props.`,
  },
  {
    id: 'backpack-packshot',
    title: 'Backpack Shot',
    description: 'Standing backpack front view',
    image: backpackPackshot,
    prompt: `Realistic studio photo of the product standing upright on white seamless, high-key light tent, even illumination, visible details, straight-on, centered, fills ~85–90%, no props.`,
  },
  {
    id: 'steel-bottle',
    title: 'Steel Bottle',
    description: 'Stainless steel with controlled reflections',
    image: steelBottle,
    prompt: `Packshot of the product on pure white, large diffused softbox to minimize harsh reflections, controlled gradient on surfaces, subtle ground shadow, centered, fills ~85–90%, no props.`,
  },
  {
    id: 'toy-figurine',
    title: 'Toy Figurine',
    description: 'Single figurine crisp detail',
    image: toyFigurine,
    prompt: `Photorealistic product on white seamless, high-key, crisp edge detail, accurate color, gentle contact shadow, centered, fills ~85–90%, no props or effects.`,
  },

  // Lifestyle / Secondary Images
  {
    id: 'headphones-desk',
    title: 'Headphones Desk',
    description: 'Minimalist desk lifestyle shot',
    image: headphonesDesk,
    prompt: `Realistic lifestyle image: the product resting on a minimalist desk setup with soft window light, neutral palette, shallow depth, gentle natural shadow, no brand logos beyond the product, clean composition.`,
  },
  {
    id: 'shoe-pavement',
    title: 'Shoe on Pavement',
    description: 'Sunlit street action suggestion',
    image: shoePavement,
    prompt: `Photoreal product placed on sunlit pavement with soft directional light, slight motion suggestion via shadow angle, no person visible, neutral background blur, true color.`,
  },
  {
    id: 'skincare-bathroom',
    title: 'Skincare Bathroom',
    description: 'Beauty bottle on bathroom tile',
    image: skincareBathroom,
    prompt: `Realistic scene: product on matte bathroom tile, soft backlight + fill, tiny water droplets on surface, color-true label, clean reflections.`,
  },
  {
    id: 'coffee-mug-kitchen',
    title: 'Coffee Mug Kitchen',
    description: 'Morning light countertop scene',
    image: coffeeMugKitchen,
    prompt: `Lifestyle: product on light wood countertop, soft morning light, neutral kitchen background, subtle depth of field.`,
  },
  {
    id: 'backpack-hook',
    title: 'Backpack Hook',
    description: 'Hanging backpack lifestyle shot',
    image: backpackHook,
    prompt: `Realistic scene: product hanging on a chair or wall hook, soft ambient light, visible texture and details, neutral wall backdrop.`,
  },
  {
    id: 'knife-cutting-board',
    title: 'Chef Knife Board',
    description: 'Knife on cutting board scene',
    image: knifeCuttingBoard,
    prompt: `Photoreal close scene: product on wooden cutting board with clean produce slices, side light to show detail, controlled reflections.`,
  },
  {
    id: 'yoga-mat-studio',
    title: 'Yoga Mat Studio',
    description: 'Rolled mat serene wellness shot',
    image: yogaMatStudio,
    prompt: `Lifestyle: product on studio floor, soft side lighting, subtle floor texture, clean and serene.`,
  },
  {
    id: 'watch-wrist',
    title: 'Watch on Wrist',
    description: 'Close wrist shot no face',
    image: watchWrist,
    prompt: `Close, realistic shot of the product worn on a wrist, neutral skin tone, soft diffused light, no face shown, background blur, color-accurate details.`,
  },
  {
    id: 'sunglasses-towel',
    title: 'Sunglasses Beach',
    description: 'Beach towel lifestyle shot',
    image: sunglassesTowel,
    prompt: `Photoreal scene: product on a textured beach towel, soft sunlight and gentle shadow, accurate colors, uncluttered composition.`,
  },
  {
    id: 'bottle-fridge',
    title: 'Bottle in Fridge',
    description: 'Cool fridge door context shot',
    image: bottleFridge,
    prompt: `Realistic image: product standing in a fridge door shelf, cool backlight, condensation beads, clean surroundings.`,
  },

  // Specialty / Challenging
  {
    id: 'jewelry-diffusion',
    title: 'Jewelry Diffusion',
    description: 'Gemstone with controlled highlights',
    image: jewelryDiffusion,
    prompt: `Photoreal product packshot on pure white seamless, large diffusion tent lighting, controlled specular highlights, focus on fine details, minimal reflections, centered, fills ~85–90%, no props.`,
  },
  {
    id: 'glass-bottle-backlit',
    title: 'Glass Bottle Backlit',
    description: 'Transparent glass with contours',
    image: glassBottleBacklit,
    prompt: `Ultra-realistic transparent product on white seamless with soft backlight to define contours, front fill to retain label legibility, controlled edge highlights, subtle ground shadow, centered, fills ~85–90%.`,
  },
  {
    id: 'textile-macro',
    title: 'Textile Macro',
    description: 'Fabric weave detail shot',
    image: textileMacro,
    prompt: `Macro shot of product texture on white background, soft raking light to show detail, high micro-contrast, color-accurate.`,
  },
  {
    id: 'white-on-white',
    title: 'White on White',
    description: 'White product shadow separation',
    image: whiteOnWhite,
    prompt: `Photoreal light-colored product on pure white background, high-key lighting with slight angled key to create soft separation shadow, micro-contrast on edges, centered, fills ~85–90%, no props.`,
  },
  {
    id: 'cosmetics-swatches',
    title: 'Cosmetics Swatches',
    description: 'True color makeup swatches',
    image: cosmeticsSwatches,
    prompt: `Realistic product swatches on a white card, soft diffused top light, neutral white balance, accurate hues, minimal shadow, clean edges.`,
  },

  // Dynamic / Splash Shots
  {
    id: 'beverage-splash-explosion',
    title: 'Beverage Splash',
    description: 'Dynamic can/bottle with ingredients bursting out',
    image: beverageSplashExplosion,
    prompt: `Hyper-realistic cinematic product photograph of the product with fresh ingredient slices bursting out in a dynamic splash. Covered in cold condensation droplets, glossy metallic texture. Juice splashes and wedges frozen mid-air, ultra-detailed. Dark gradient background, soft studio lighting, dramatic highlights, shallow depth of field, cinematic advertising style, ultra-sharp focus, 8K resolution, photorealistic, premium {productType} ad.`,
  },
  {
    id: 'fruit-splash-product',
    title: 'Fruit Splash',
    description: 'Product in creamy splash with frozen motion',
    image: fruitSplashProduct,
    prompt: `Ultra-macro product photography of the product suspended in a creamy milk splash, high-speed frozen motion capture, clean studio backdrop, backlit liquid arcs catching the light, single color accent, ultra-detailed texture, 8K resolution, commercial advertising style.`,
  },
  {
    id: 'coffee-pour-commercial',
    title: 'Coffee Pour',
    description: 'Cinematic coffee elements suspended mid-air',
    image: coffeePourCommercial,
    prompt: `Ultra-cinematic vertical composition of the product with coffee elements suspended in mid-air, steam tendrils rising, scattered roasted beans, caramel swirl frozen in motion, warm amber side lighting, rich dark background, premium {productType} advertising style, 8K resolution, shallow depth of field, photorealistic.`,
  },

  // Levitation / Zero-Gravity
  {
    id: 'product-levitation',
    title: 'Product Levitation',
    description: 'Floating product with dramatic single key light',
    image: productLevitation,
    prompt: `Premium advertising photograph of the product floating mid-air with a slight dynamic tilt against a pure black void background. Single dramatic key light from upper left, precise sharp shadow cast on surface below, controlled rim lighting defining edges, ultra-sharp focus, 8K resolution, professional commercial product shot, minimal composition.`,
  },
  {
    id: 'ingredient-explosion',
    title: 'Ingredient Explosion',
    description: 'Product with raw ingredients orbiting in zero gravity',
    image: ingredientExplosion,
    prompt: `Hyper-realistic product photograph with the product center-frame, surrounded by raw ingredients — fresh flowers, fruits, spices, herbs — orbiting in zero gravity. Clean studio lighting, dark gradient background, ultra-sharp focus on product, ingredients slightly motion-blurred at edges, 8K resolution, cinematic commercial style.`,
  },
  {
    id: 'floating-luxury',
    title: 'Floating Luxury',
    description: 'Product suspended over reflective water surface',
    image: floatingLuxury,
    prompt: `Luxury product photograph of the product suspended weightlessly above a dark reflective water surface, subtle ripples radiating below, moody studio lighting with soft rim light, deep dark elegant background, mirror-like reflection visible in water, ultra-sharp detail, 8K resolution, premium editorial style.`,
  },

  // Luxury / Editorial
  {
    id: 'luxury-perfume-editorial',
    title: 'Luxury Perfume',
    description: 'Deep-colored glass with petals and dramatic lighting',
    image: luxuryPerfumeEditorial,
    prompt: `Ultra-realistic cinematic product photography of the product with rich colored liquid visible through glass, surrounded by fresh flower petals and botanicals. Dramatic rim lighting from behind, dark moody background, Phase One medium format camera look with 100mm macro lens, editorial magazine quality, razor-sharp macro focus capturing every texture detail, shallow depth of field, 8K resolution.`,
  },
  {
    id: 'premium-serum-macro',
    title: 'Premium Serum',
    description: 'Cylindrical glass bottle with falling droplet',
    image: premiumSerumMacro,
    prompt: `High-contrast studio product shot of the product — cylindrical serum bottle diagonally tilted, golden amber liquid visible through glass, single droplet falling from dropper tip frozen in mid-air, soft bokeh background, dramatic overhead key light with soft fill, specular highlights on glass, 8K resolution, {productType} editorial photography.`,
  },
  {
    id: 'luxury-flat-lay',
    title: 'Luxury Flat Lay',
    description: 'Product on bath tray with botanicals',
    image: luxuryFlatLay,
    prompt: `8K ultra-realistic luxury lifestyle flat-lay composition of the product placed on an elegant slatted wooden bath tray spanning a freestanding bathtub. Scattered dried botanicals, a rolled linen towel, and soft overhead natural light. Warm neutral tones, gentle shadows, spa-like atmosphere, editorial interior photography style.`,
  },
  {
    id: 'marble-pedestal',
    title: 'Marble Pedestal',
    description: 'Product on pedestal with warm beige backdrop',
    image: marblePedestal,
    prompt: `Perfect advertising photograph of the product standing on a round marble pedestal, isolated on warm beige background, soft directional lighting from upper left casting gentle shadow, scattered raw ingredient elements nearby, clean composition, color-accurate, 8K resolution, commercial product photography.`,
  },

  // Beauty / Cosmetics Social Media
  {
    id: 'hand-held-beauty',
    title: 'Hand-Held Beauty',
    description: 'Manicured hand holding product against pastel bg',
    image: handHeldBeauty,
    prompt: `Photorealistic close-up of a manicured hand holding the product at a slight angle against a soft pastel gradient background. Natural soft lighting, clean nails with neutral polish, minimal gold jewelry, product label readable, shallow depth of field, {productType} editorial style, 8K resolution.`,
  },
  {
    id: 'skincare-routine-flatlay',
    title: 'Skincare Flat Lay',
    description: 'Multiple products on marble with flowers',
    image: skincareRoutineFlatlay,
    prompt: `Ultra-realistic overhead flat-lay of the product arranged with complementary {productType} items on a white marble or terrazzo surface. Fresh cut flowers, tiny water droplets scattered on surface, soft diffused morning light from window, {productType} magazine editorial style, clean composition, color-accurate, 8K resolution.`,
  },
  {
    id: 'cosmetics-water-float',
    title: 'Cosmetics Water Float',
    description: 'Product floating in still water',
    image: cosmeticsWaterFloat,
    prompt: `Cinematic product shot of the product — a minimalist tube or bottle floating in perfectly still water, gentle ripples radiating outward, soft reflection visible below, muted pastel tones, serene spa-like atmosphere, diffused overhead lighting, 8K resolution, premium {productType} advertising.`,
  },
  {
    id: 'beauty-glow-shot',
    title: 'Beauty Glow',
    description: 'Product with radiant glow and botanical elements',
    image: beautyGlowShot,
    prompt: `Photorealistic {productType} product shot of the product with a soft radiant glow emanating from behind, dewy moisture texture on surface, fresh botanical elements — eucalyptus sprigs, flower petals — scattered around, light airy background, {productType} editorial lighting with large softbox, 8K resolution, ultra-sharp focus.`,
  },

  // Nature / Organic Settings
  {
    id: 'forest-floor-product',
    title: 'Forest Floor',
    description: 'Frosted glass product on mossy forest floor',
    image: forestFloorProduct,
    prompt: `Photorealistic product photography of the product — frosted translucent glass — resting on a mossy forest floor. Dappled sunlight filtering through canopy, fresh ferns and tiny wildflowers surrounding, morning dew droplets on product surface, natural and organic atmosphere, shallow depth of field, 8K resolution, editorial nature photography.`,
  },
  {
    id: 'botanical-garden',
    title: 'Botanical Garden',
    description: 'Product nestled among fresh flowers and greenery',
    image: botanicalGarden,
    prompt: `Realistic product photograph of the product nestled among lush fresh flowers and greenery. Warm natural window light from the side, greenhouse vibes with condensation on glass surfaces nearby, soft focus on surrounding flora, product sharp and centered, 8K resolution, lifestyle editorial photography.`,
  },
  {
    id: 'fantasy-meadow',
    title: 'Fantasy Meadow',
    description: 'Product in miniature meadow with ethereal lighting',
    image: fantasyMeadow,
    prompt: `Hyper-realistic luxury product photograph of the product placed in a lush miniature fantasy meadow setting. Tiny colorful wildflowers, soft ethereal golden-hour lighting, dreamy atmosphere with subtle bokeh, dew drops on petals, macro perspective making product appear monumental, 8K resolution, premium editorial style.`,
  },

  // Texture / Material Hero Shots
  {
    id: 'plush-fabric-render',
    title: 'Plush Fabric',
    description: 'Product reimagined in fluffy plush texture',
    image: plushFabricRender,
    prompt: `Product visualization of the product entirely made from vibrant fluffy plush fabric, positioned centrally against a soft plush background. Bold pop art and Memphis design style, playful yet premium aesthetic. Bright clean studio lighting emphasizing plush texture, visible fibers, softness and tactile depth. Sharp focus, high color saturation, smooth shadows, modern commercial product shot, ultra-high resolution.`,
  },
  {
    id: 'chrome-prismatic',
    title: 'Chrome Prismatic',
    description: 'Fluid chrome product with prismatic refraction',
    image: chromePrismatic,
    prompt: `Product rendered in fluid chrome with dynamic glass refraction and prismatic chromatic aberration. Pure black void background, controlled specular highlights creating rainbow caustics, Y2K futuristic tech aesthetic, high-{productType} editorial product photography, ultra-sharp focus, 8K resolution, premium commercial style.`,
  },
  {
    id: 'frosted-glass-product',
    title: 'Frosted Glass',
    description: 'Product with frosted glass treatment and gradient bg',
    image: frostedGlassProduct,
    prompt: `Premium minimalist product photography of the product with a frosted translucent glass treatment, soft pastel gradient background transitioning from warm to cool tones, controlled edge lighting defining product silhouette, gentle diffused shadows, clean and modern aesthetic, ultra-sharp focus, 8K resolution, commercial {productType} style.`,
  },

  // Grid / Lookbook Layouts
  {
    id: 'nine-panel-product-grid',
    title: '9-Panel Grid',
    description: '3x3 grid showing product from multiple angles',
    image: ninePanelProductGrid,
    prompt: `Photorealistic studio contact sheet, 3x3 grid layout of the product from nine perspectives: hero profile shot, top-down detail macro, lifestyle context scene, material texture closeup, scale reference with hand, action/use shot, packaging front view, ingredient or feature scatter, atmospheric mood shot. Consistent studio lighting across all panels, thin white grid lines separating each frame, cohesive color grade, 8K resolution.`,
  },
  {
    id: 'before-after-split',
    title: 'Before/After Split',
    description: 'Vertical split of packaging vs lifestyle',
    image: beforeAfterSplit,
    prompt: `Hyper-realistic vertical split-screen product photograph. Left half: product in pristine packaging on clean white background with studio lighting. Right half: product in aspirational lifestyle setting, being used or displayed beautifully. Clean dividing line down center, consistent color temperature across both halves, 8K resolution, commercial advertising layout.`,
  },

  // Seasonal / Themed Social
  {
    id: 'summer-vibes-product',
    title: 'Summer Vibes',
    description: 'Product on sandy surface with golden hour warmth',
    image: summerVibesProduct,
    prompt: `Photorealistic summer lifestyle product shot of the product on a sandy surface with scattered seashells and dried starfish. Warm golden hour sunlight from the side, subtle lens flare, turquoise ocean water blur in background, relaxed beach atmosphere, color-accurate product detail, 8K resolution, social media advertising style.`,
  },
  {
    id: 'cozy-winter-product',
    title: 'Cozy Winter',
    description: 'Product on knit blanket with warm candlelight',
    image: cozyWinterProduct,
    prompt: `Ultra-realistic cozy winter lifestyle shot of the product resting on a chunky knit blanket texture. Warm candlelight glow in background, a steaming hot drink nearby, hygge atmosphere, shallow depth of field with warm bokeh, muted warm tones, inviting and intimate composition, 8K resolution, editorial lifestyle photography.`,
  },
  {
    id: 'spring-fresh-product',
    title: 'Spring Fresh',
    description: 'Product surrounded by fresh flowers and dewdrops',
    image: springFreshProduct,
    prompt: `Photorealistic spring product photograph of the product surrounded by fresh-cut pastel flowers and scattered petals. Bright natural light from above, white and pastel backdrop, visible dewdrops on petals and product surface, clean and vibrant color palette, airy open composition, 8K resolution, {productType} editorial advertising.`,
  },

  // Beauty — Skincare
  {
    id: 'serum-dropper-macro',
    title: 'Serum Dropper Macro',
    description: 'Glass serum bottle with golden droplet falling',
    image: serumDropperMacro,
    prompt: `Ultra-macro {productType} product photography of the product — a cylindrical glass serum bottle, dropper pulled out with a single golden droplet suspended mid-fall, viscous liquid catching the light. Soft neutral gradient background, dramatic overhead key light with warm fill, specular highlights on glass edges, shallow depth of field, ultra-sharp focus on dropper tip, 8K resolution, luxury {productType} editorial.`,
  },
  {
    id: 'cream-jar-texture-swirl',
    title: 'Cream Texture Swirl',
    description: 'Open jar with rich swirled cream texture',
    image: creamJarTextureSwirl,
    prompt: `Hyper-realistic top-down macro shot of the product — an open {productType} jar revealing a rich, glossy cream with a pristine silky swirl texture. Soft studio lighting emphasizing the buttery surface peaks and valleys, subtle shadow in the spiral, clean white jar edges, neutral warm background, premium {productType} advertising, ultra-detailed texture, 8K resolution.`,
  },
  {
    id: 'skincare-water-stone',
    title: 'Skincare on Stone',
    description: 'Product on pale stone in crystal-clear water',
    image: skincareWaterStone,
    prompt: `Ultra-realistic {productType} product photograph of the product placed on a smooth pale stone partially submerged in crystal-clear shallow water. Gentle water ripples surrounding the stone, natural light refractions and caustic patterns on the surface below, tiny water droplets adding freshness. Serene clean environment evoking purity and hydration. Cool airy color palette — soft whites, light blues, stone neutrals. Bright diffused daylight, shallow depth of field, editorial-quality product shot, 8K resolution.`,
  },
  {
    id: 'skincare-scrub-explosion',
    title: 'Scrub Explosion',
    description: 'Open jar with scrub erupting alongside fresh fruit',
    image: skincareScrubExplosion,
    prompt: `Hyperrealistic luxury product photography of the product — a transparent {productType} jar with whipped scrub erupting upward from the open lid in a dynamic burst. Lid suspended above the jar, surrounded by fresh fruit cubes, halved tropical fruits, and golden droplets frozen in motion. Centered macro view, cinematic studio lighting from above, glowing highlights, shallow depth of field, warm nude gradient background, premium {productType} advertising, 8K resolution.`,
  },
  {
    id: 'face-mask-squeeze',
    title: 'Face Mask Squeeze',
    description: 'Tube squeezed between glossy balloon spheres',
    image: faceMaskSqueeze,
    prompt: `Photorealistic commercial {productType} shot of the product tube tightly squeezed between two large glossy pink balloon-like spheres. Balloons press inward creating a playful compression effect around the tube. Product centered vertically, front label sharp and readable. Ultra-clean studio {productType} lighting, smooth highlights, soft specular reflections on balloons. Soft pastel pink gradient background, minimal and distraction-free. Modern minimalistic premium {productType} advertising, playful composition, luxury {productType} campaign energy, 8K resolution.`,
  },
  {
    id: 'moisturizer-dewy-skin',
    title: 'Moisturizer Dewy',
    description: 'Cream jar with dewy fresh skin texture vibe',
    image: moisturizerDewySkin,
    prompt: `Premium {productType} product photograph of the product — a moisturizer jar — with tiny water droplets and fine mist clinging to its surface, evoking fresh dewy skin. Soft diffused lighting from above, pale aqua and white clean background, a single fresh green leaf resting beside the jar, gentle reflective surface below, hyper-realistic textures on every droplet, 8K resolution, high-end {productType} commercial.`,
  },
  {
    id: 'skincare-vanity-shelfie',
    title: 'Vanity Shelfie',
    description: 'Products arranged on marble vanity shelf',
    image: skincareVanityShelfie,
    prompt: `Photorealistic lifestyle {productType} shot of the product displayed on a white marble vanity shelf alongside complementary {productType} items. Small potted succulent, a round mirror reflecting soft light, gold-accented tray. Warm diffused bathroom lighting, clean and aspirational aesthetic, shallow depth of field with product sharp in foreground, 8K resolution, Instagram-ready {productType} editorial.`,
  },

  // Beauty — Makeup
  {
    id: 'lipstick-bullet-macro',
    title: 'Lipstick Bullet',
    description: 'Lipstick twisted up with melting color drip',
    image: lipstickBulletMacro,
    prompt: `Ultra-macro {productType} photography of the product — a lipstick bullet fully extended from its tube, rich saturated color with a creamy melting drip running down the side. Controlled studio lighting with specular highlight along the bullet edge, dark moody background, shallow depth of field, color-accurate pigment, luxurious texture detail visible, 8K resolution, high-{productType} editorial.`,
  },
  {
    id: 'foundation-swatch-skin',
    title: 'Foundation Swatches',
    description: 'Multiple shade swatches on diverse skin',
    image: foundationSwatchSkin,
    prompt: `Photorealistic {productType} product shot showing the product — foundation swatches in a gradient of shades applied as clean parallel stripes on a forearm with natural skin texture. Soft diffused overhead light, neutral background, true-to-life color accuracy for each shade, sharp focus on swatch edges blending into skin, 8K resolution, inclusive {productType} advertising style.`,
  },
  {
    id: 'eyeshadow-palette-scatter',
    title: 'Palette Scatter',
    description: 'Open eyeshadow palette with loose powder scatter',
    image: eyeshadowPaletteScatter,
    prompt: `Hyper-realistic overhead {productType} shot of the product — an open eyeshadow palette with vibrant pressed powders, surrounded by artistic scattered loose pigment dust in matching colors. Clean white surface, dramatic directional light casting long soft shadows, color-accurate shimmer and matte finishes visible, some pans showing finger-swipe texture, editorial {productType} photography, 8K resolution.`,
  },
  {
    id: 'mascara-wand-closeup',
    title: 'Mascara Wand',
    description: 'Pulled wand with product texture detail',
    image: mascaraWandCloseup,
    prompt: `Ultra-macro {productType} photograph of the product — a mascara wand pulled from its tube with thick glossy black formula coating the bristles, a thin strand stretching between wand and tube opening. Clean white or soft pink background, bright diffused studio lighting, extreme close-up showing individual bristle detail and product texture, 8K resolution, premium {productType} advertising.`,
  },
  {
    id: 'blush-compact-shatter',
    title: 'Blush Shatter',
    description: 'Pressed blush with artistic crack and powder dust',
    image: blushCompactShatter,
    prompt: `Photorealistic {productType} product shot of the product — an open blush compact with the pressed powder artistically cracked and shattered, fine pigment dust floating in the air around it. Dark moody background, dramatic side lighting catching suspended particles, the compact mirror reflecting soft light, luxurious and editorial, 8K resolution, high-{productType} campaign.`,
  },
  {
    id: 'makeup-brush-powder-burst',
    title: 'Brush Powder Burst',
    description: 'Makeup brush with colorful powder explosion',
    image: makeupBrushPowderBurst,
    prompt: `High-speed {productType} photography of the product — a makeup brush mid-tap releasing a vibrant burst of colored powder into the air. Powder particles frozen in motion forming an expressive cloud, dark background isolating the color explosion, dramatic side lighting catching every particle, sharp focus on brush bristles, 8K resolution, creative {productType} editorial.`,
  },
  {
    id: 'lip-gloss-drip',
    title: 'Lip Gloss Drip',
    description: 'Applicator with glossy drip against clean backdrop',
    image: lipGlossDrip,
    prompt: `Ultra-realistic macro {productType} shot of the product — a lip gloss applicator pulled from the tube with a thick, glossy, honey-like drip of product stretching downward. Translucent shimmer visible in the formula, soft pink gradient background, clean studio lighting with specular highlights on the gloss surface, extreme close-up detail, 8K resolution, luxury {productType} advertising.`,
  },

  // Beauty — Fragrance
  {
    id: 'perfume-dark-woody',
    title: 'Perfume Dark Wood',
    description: 'Luxury bottle with rugged wood and smoky haze',
    image: perfumeDarkWoody,
    prompt: `Ultra-realistic cinematic product photography of the product — a luxury perfume bottle filled with deep amber liquid, thick glass with sharp sculptural edges and a bold cap. Surrounded by dark rugged wood textures, bark, and crushed wood chips creating a rich woody atmosphere. Dramatic dark background with smoky haze and warm glowing embers, intense contrast lighting, strong rim light highlighting bottle silhouette, glossy reflections on glass, deep shadows, moody sensual aesthetic, 8K resolution.`,
  },
  {
    id: 'perfume-floral-petals',
    title: 'Perfume Floral',
    description: 'Glass bottle with flower petals visible inside',
    image: perfumeFloralPetals,
    prompt: `Hyper-realistic luxury perfume product photograph of the product — a transparent glass bottle with softly rounded edges, warm amber-orange tint with high transparency and internal reflections. Delicate flower petals visible inside the glass, soft peach highlights, layered and overlapping semi-translucent petals. A large blooming flower crowning the top, floating petals scattered throughout the scene, small water droplets and splash arcs frozen mid-motion. Warm orange gradient background, soft vivid studio lighting, subtle glow around glass edges, 8K resolution, premium {productType} advertising.`,
  },
  {
    id: 'perfume-meadow-fantasy',
    title: 'Perfume Meadow',
    description: 'Fragrance bottle in lush miniature meadow',
    image: perfumeMeadowFantasy,
    prompt: `Hyper-realistic luxury perfume product photograph of the product placed in a lush miniature fantasy meadow. Moss-covered ground, delicate pink, lavender, and coral wildflowers, soft green grasses, tiny petals drifting in the air, faint floating mist. Warm golden-pink light from upper left creating a dreamy sunset effect, studio-grade rim light on bottle edges. Cinematic shallow depth of field, softly blurred blooms in foreground, pastel bokeh haze background, romantic ethereal mood, 8K resolution, editorial {productType} aesthetic.`,
  },
  {
    id: 'perfume-mist-spray',
    title: 'Perfume Mist',
    description: 'Bottle with fine atomized mist captured mid-spray',
    image: perfumeMistSpray,
    prompt: `Ultra-realistic {productType} product photograph of the product — a hand holding a metallic perfume bottle, finger pressing the nozzle with fine atomized mist captured mid-spray, backlit to reveal every tiny droplet suspended in the air. Soft gradient background shifting from blush pink to warm gold, dramatic rim lighting defining the mist cloud, shallow depth of field, 8K resolution, luxury {productType} campaign.`,
  },

  // Beauty — Hair & Body Care
  {
    id: 'shampoo-pour-silk',
    title: 'Shampoo Silk Pour',
    description: 'Bottle with pearlescent liquid pouring out',
    image: shampooPourSilk,
    prompt: `Photorealistic {productType} product shot of the product — a shampoo or conditioner bottle tipped at an angle with thick pearlescent liquid pouring out in a smooth ribbon. Liquid frozen mid-pour with a silky glossy surface catching studio light. Clean white background, soft diffused overhead lighting, controlled reflections on the bottle, product label readable, 8K resolution, premium {productType} advertising.`,
  },
  {
    id: 'body-oil-golden-pour',
    title: 'Body Oil Pour',
    description: 'Amber oil cascading over smooth surface',
    image: bodyOilGoldenPour,
    prompt: `Ultra-realistic macro {productType} photograph of the product — a body oil bottle with golden amber oil cascading down its surface in a slow viscous pour. Warm backlight catching the translucent oil, creating a glowing honey-like effect. Soft bokeh background in warm neutral tones, specular highlights on every oil ripple, extreme texture detail, 8K resolution, luxury body care editorial.`,
  },
  {
    id: 'bath-bomb-fizz',
    title: 'Bath Bomb Fizz',
    description: 'Colorful bath bomb dissolving in milky water',
    image: bathBombFizz,
    prompt: `Photorealistic {productType} product shot of the product — a vibrant bath bomb mid-dissolve in milky pastel-tinted water, colorful swirls and fizzing bubbles radiating outward, petals floating on the water surface. Overhead perspective, soft natural bathroom light, steam wisps visible, clean white tub edge framing the shot, serene spa atmosphere, 8K resolution, {productType} lifestyle advertising.`,
  },

  // Beauty — Nail & Accessories
  {
    id: 'nail-polish-drip',
    title: 'Nail Polish Drip',
    description: 'Open bottle with color dripping down brush',
    image: nailPolishDrip,
    prompt: `Ultra-macro {productType} photograph of the product — a nail polish bottle with the brush pulled out, thick glossy lacquer dripping from the bristles in a single viscous strand. Rich saturated color, clean studio lighting with specular highlight along the drip, dark elegant background, extreme close-up showing pigment density and shine, 8K resolution, luxury nail brand advertising.`,
  },
  {
    id: 'nail-polish-spill-art',
    title: 'Nail Polish Spill',
    description: 'Artistic color spill creating paint-like puddle',
    image: nailPolishSpillArt,
    prompt: `Hyper-realistic overhead {productType} shot of the product — a tipped nail polish bottle with glossy lacquer spilling out in an artistic paint-like puddle. Rich color spreading across a clean white surface, bottle casting a gentle shadow, high-gloss reflections in the spill, soft studio lighting from above, clean minimal composition, 8K resolution, creative {productType} editorial.`,
  },
  {
    id: 'jewelry-on-skin',
    title: 'Jewelry on Skin',
    description: 'Layered gold necklace on neckline close-up',
    image: jewelryOnSkin,
    prompt: `Photorealistic close-up {productType} shot of the product — layered gold necklaces resting on a neckline and upper chest area. Delicate thin chains with small pendant details, warm skin tone, soft diffused natural lighting emphasizing gold shine, shallow depth of field, subtle fabric texture of a simple knit top visible at edges, lifestyle {productType} aesthetic, 8K resolution, {productType} product photography.`,
  },

  // Beauty — Lifestyle & Social Media
  {
    id: 'beauty-bathroom-steam',
    title: 'Bathroom Steam',
    description: 'Products on counter with warm steam atmosphere',
    image: beautyBathroomSteam,
    prompt: `Photorealistic lifestyle {productType} shot of the product on a clean bathroom counter with visible warm steam in the air from a recent shower. Soft condensation on a nearby mirror, warm ambient lighting, small water droplets on the counter surface, product label sharp and readable, towel draped in background, intimate spa-like atmosphere, 8K resolution, {productType} lifestyle editorial.`,
  },
  {
    id: 'beauty-hand-apply',
    title: 'Hand Apply',
    description: 'Fingers scooping cream from open jar',
    image: beautyHandApply,
    prompt: `Ultra-realistic close-up {productType} photograph of two fingers gently scooping a dollop of cream from the product — an open {productType} jar. Rich creamy texture visible on fingertips, clean manicured nails, soft studio lighting, the jar partially visible below, smooth blurred pastel background, tactile and sensory composition, 8K resolution, premium {productType} editorial.`,
  },
  {
    id: 'beauty-mirror-reflection',
    title: 'Mirror Reflection',
    description: 'Product reflected in round vanity mirror',
    image: beautyMirrorReflection,
    prompt: `Photorealistic {productType} lifestyle shot of the product reflected in a round gold-framed vanity mirror on a clean surface. Soft warm lighting from the side, the actual product slightly out of focus in foreground with the mirror reflection sharp and centered, scattered dried flowers nearby, warm neutral tones, aspirational {productType} aesthetic, 8K resolution, social media editorial.`,
  },
  {
    id: 'beauty-silk-fabric',
    title: 'Silk Fabric Lay',
    description: 'Product on draped silk with soft shadows',
    image: beautySilkFabric,
    prompt: `Ultra-realistic {productType} product photograph of the product resting on softly draped silk or satin fabric in a blush pink or champagne tone. Gentle fabric folds creating organic shadow patterns, warm diffused overhead lighting, subtle sheen on the fabric surface, product label sharp and centered, luxurious and tactile composition, 8K resolution, high-end {productType} advertising.`,
  },
  {
    id: 'beauty-ice-cold',
    title: 'Beauty on Ice',
    description: 'Product on ice with frost and cool blue tones',
    image: beautyIceCold,
    prompt: `Hyper-realistic {productType} product shot of the product resting on a bed of crushed ice, frost crystals forming on the product surface and surrounding ice. Cool blue studio lighting with white highlights, condensation droplets, clean clinical aesthetic evoking cooling and soothing properties, shallow depth of field, 8K resolution, premium {productType} advertising.`,
  },
  {
    id: 'beauty-citrus-splash',
    title: 'Citrus Splash',
    description: 'Product with citrus slices and juice splash',
    image: beautyCitrusSplash,
    prompt: `Ultra-realistic {productType} product photograph of the product surrounded by fresh citrus slices — lemon, orange, grapefruit — with juice splashes frozen mid-air. Bright clean white background, vivid natural colors, tiny water droplets on product surface, fresh and energizing composition, overhead studio lighting, ultra-sharp focus, 8K resolution, vibrant {productType} advertising.`,
  },
  {
    id: 'beauty-honey-drizzle',
    title: 'Honey Drizzle',
    description: 'Product with golden honey cascading over it',
    image: beautyHoneyDrizzle,
    prompt: `Hyper-realistic {productType} product photograph of the product with thick golden honey being drizzled over the top, viscous streams cascading down the sides. Warm amber backlighting making the honey glow translucent, honeycomb fragment and small wildflowers nearby, dark warm gradient background, extreme texture detail on every honey strand, 8K resolution, luxury natural {productType} advertising.`,
  },
  {
    id: 'beauty-rose-petals-bath',
    title: 'Rose Petal Bath',
    description: 'Product floating among rose petals in milky water',
    image: beautyRosePetalsBath,
    prompt: `Photorealistic overhead {productType} shot of the product floating in milky rose-tinted bath water, surrounded by scattered fresh rose petals in pink and cream tones. Soft natural light from a window, gentle ripples in the water surface, product label visible and sharp, serene romantic spa atmosphere, warm pastel color palette, 8K resolution, luxury {productType} lifestyle editorial.`,
  },
  {
    id: 'beauty-cotton-cloud',
    title: 'Cotton Cloud',
    description: 'Product resting on fluffy cotton cloud-like surface',
    image: beautyCottonCloud,
    prompt: `Ultra-realistic {productType} product shot of the product resting on a soft fluffy cotton or cloud-like surface that evokes weightlessness and gentleness. Bright clean white background, soft even diffused lighting from all sides, gentle shadow beneath the cotton, product appearing to float, airy and pure aesthetic, 8K resolution, sensitive {productType} advertising.`,
  },
  {
    id: 'beauty-aloe-gel',
    title: 'Aloe Gel Splash',
    description: 'Product with translucent green gel and aloe leaves',
    image: beautyAloeGel,
    prompt: `Hyper-realistic {productType} product photograph of the product surrounded by fresh sliced aloe vera leaves with translucent green gel visible. Gel smears artistically on the clean surface beside the product, tiny water droplets throughout, bright clean lighting with a soft green-white color palette, fresh and natural aesthetic, ultra-sharp focus, 8K resolution, natural {productType} advertising.`,
  },

  // Social & Ads — platform-native creative
  {
    id: 'ig-feed-square',
    title: 'Instagram Feed 1:1',
    description: 'Clean 1:1 feed post with negative space for a caption sticker',
    image: igFeedSquare,
    prompt: `Ultra-realistic 1:1 square Instagram feed product photograph of the product placed slightly off-center on a soft pastel paper backdrop, shot at 50mm f/4, soft window light from upper left, gentle contact shadow, warm minimal color palette, generous negative space in the top-right for a caption sticker overlay, color-accurate label, no text, no watermark, no logos beyond the product, 2026 social media feed aesthetic, shot ratio 1:1.`,
  },
  {
    id: 'ig-story-vertical',
    title: 'Instagram Story 9:16',
    description: 'Full-bleed 9:16 story shot with top and bottom safe zones',
    image: igStoryVertical,
    prompt: `Ultra-realistic 9:16 vertical Instagram Story photograph of the product centered in the middle third of the frame, tall pastel gradient backdrop, soft directional window light, subtle motion-blur hand reaching in from the right, generous empty space at top (for profile/sticker safe zone) and bottom (for reply bar safe zone), shallow depth of field at f/2.8, 2026 Gen Z story aesthetic, color-accurate product label, no on-image text, shot ratio 9:16.`,
  },
  {
    id: 'ig-carousel-hook',
    title: 'Carousel Slide 1 Hook',
    description: 'Bold opening slide of a carousel with strong focal product',
    image: igCarouselHook,
    prompt: `Hyper-realistic Instagram carousel opening slide of the product shot straight-on against a bold saturated color block background (choose a single vivid hue), dramatic single-source softbox from 45° upper-left, high-contrast shadow anchoring the product, crisp product edges, large clean area at top for a punchy two-word hook overlay, modern editorial feel, shot ratio 4:5, 8K resolution, no text rendered in image.`,
  },
  {
    id: 'tiktok-vertical-hook',
    title: 'TikTok Vertical Hook',
    description: 'Energetic 9:16 product hero for a TikTok hook frame',
    image: tiktokVerticalHook,
    prompt: `Ultra-realistic 9:16 vertical TikTok-style product photograph of the product tossed slightly mid-air against a vibrant gradient backdrop (punchy duotone — cobalt to magenta), slight motion streak behind product, handheld iPhone-flash look with hard shadow, product sharp and centered at eye-level third, empty top zone for a caption, native social-video aesthetic, authentic slightly-imperfect styling, shot ratio 9:16, 2026 TikTok feed energy.`,
  },
  {
    id: 'fb-meta-ad-cta',
    title: 'Meta Ad + CTA Space',
    description: '1.91:1 landscape ad with clean right-side negative space',
    image: fbMetaAdCta,
    prompt: `Ultra-realistic 1.91:1 landscape Meta/Facebook ad composition of the product placed in the left third of the frame on a clean warm-neutral surface, soft diffused studio light from upper-left, tidy prop cluster nearby, large clean negative space filling the right two-thirds for a headline and CTA button overlay, color-true product label, shot at 50mm f/5.6, crisp commercial advertising style, shot ratio 1.91:1, no rendered text.`,
  },
  {
    id: 'pinterest-vertical-pin',
    title: 'Pinterest Pin 2:3',
    description: 'Tall 2:3 pin with editorial aspirational styling',
    image: pinterestVerticalPin,
    prompt: `Photorealistic 2:3 vertical Pinterest pin composition of the product styled editorially on a linen-draped surface with seasonal botanicals, soft overhead natural light, muted warm palette, product slightly elevated on a small cream pedestal, generous clear area near the top third for a headline overlay, tasteful aspirational home-editorial mood, shot at 35mm f/4, shot ratio 2:3, 8K resolution.`,
  },
  {
    id: 'ad-4x5-headline',
    title: 'Paid Ad 4:5 Headline',
    description: '4:5 paid social ad framing with top headline space',
    image: ad4x5Headline,
    prompt: `Ultra-realistic 4:5 vertical paid social ad photograph of the product hero-centered in the lower two-thirds on a soft blush-to-peach gradient seamless, studio softbox from upper-left plus warm fill, clean negative space in the top third for a headline overlay, subtle product shadow, crisp color-accurate label, shot at 85mm f/5.6 ISO 100, premium DTC ad look, shot ratio 4:5 --ar 4:5.`,
  },
  {
    id: 'ugc-iphone-look',
    title: 'UGC iPhone Look',
    description: 'Authentic UGC-style handheld iPhone product shot',
    image: ugcIphoneLook,
    prompt: `Authentic UGC-style iPhone photograph of a hand holding the product close to the camera in a sunlit kitchen, slight sensor noise, mild JPEG crunch, warm on-camera phone color, imperfect composition with a tiny bit of motion blur, overexposed window behind, real-life counter clutter blurred out of focus, completely un-retouched amateur feel, shot ratio 4:5, 2026 influencer-grade UGC aesthetic, no filters, no text.`,
  },
  {
    id: 'daily-5-flatlay',
    title: 'Daily 5 Flat Lay',
    description: 'Top-down “5 things I use daily” curated flat lay',
    image: daily5Flatlay,
    prompt: `Hyper-realistic overhead flat-lay composition for a “5 things I use daily” social post — the product as the hero piece plus four complementary everyday items (keys, earbuds case, small notebook, linen pouch) arranged on a warm oat-colored linen background. Even soft natural daylight, tidy minimalist styling, equal spacing, subtle cast shadows, crisp color-accurate product label, shot ratio 1:1, 8K resolution, 2026 lifestyle editorial.`,
  },
  {
    id: 'hero-banner-landscape',
    title: 'Hero Banner 16:9',
    description: 'Wide 16:9 hero banner with left-side product',
    image: heroBannerLandscape,
    prompt: `Photorealistic 16:9 landscape hero banner of the product positioned in the left third on a soft tonal set (warm sand surface, blurred architectural backdrop), cinematic diffused side light, long gentle shadow trailing right, expansive clean negative space on the right two-thirds for headline and CTA, modern DTC site banner style, shot at 50mm f/4, shot ratio 16:9, 8K resolution, no rendered text.`,
  },
  {
    id: 'before-after-vertical-ad',
    title: 'Before/After Ad 9:16',
    description: '9:16 vertical split for paid before/after creative',
    image: beforeAfterVerticalAd,
    prompt: `Ultra-realistic 9:16 vertical split-screen ad of the product — top half labeled visually with a dull desaturated “before” scene (muted tones, tired lighting), bottom half a vibrant color-graded “after” scene with the product hero-lit. Clean horizontal divider at the middle, matched perspective in both halves, color-accurate product, polished paid-social creative look, shot ratio 9:16, 8K resolution, no rendered text.`,
  },
  {
    id: 'aspirational-hand-hold',
    title: 'Aspirational Hand Hold',
    description: 'Lifestyle hand holding product in golden-hour light',
    image: aspirationalHandHold,
    prompt: `Photorealistic aspirational lifestyle shot of a hand holding the product up against a softly blurred golden-hour outdoor backdrop, sunbeam flare catching the top edge of the product, warm skin tones, minimal jewelry, shallow depth of field at 85mm f/1.8, color-accurate product label in sharp focus, natural unposed feel, shot ratio 4:5, 8K resolution, 2026 lifestyle ad aesthetic.`,
  },
  {
    id: 'trendy-shelfie-vertical',
    title: 'Trendy Shelfie 9:16',
    description: 'Vertical “shelfie” tabletop styling for stories',
    image: trendyShelfieVertical,
    prompt: `Ultra-realistic 9:16 vertical “shelfie” tabletop composition with the product centered on a small ribbed ceramic tray, flanked by a taper candle, a stack of two coffee-table books, and a trailing pothos leaf. Warm bulb lamp light from the right, soft shadows, warm neutral palette, cozy 2026 home-aesthetic mood, shallow depth of field, shot ratio 9:16, 8K resolution, color-true label.`,
  },
  {
    id: 'reel-cover-minimal',
    title: 'Reel Cover Minimal',
    description: 'Minimalist 9:16 reel cover with centered product',
    image: reelCoverMinimal,
    prompt: `Minimalist 9:16 vertical Instagram Reel cover of the product perfectly centered on a soft single-tone backdrop (warm cream), extremely clean composition, tiny hero product with large surrounding negative space, soft even studio light, subtle contact shadow, precise symmetry for a tap-worthy thumbnail, shot ratio 9:16, 8K resolution, no rendered text, 2026 editorial reel cover style.`,
  },

  // Health / Wellness — supplements, vitamins, fitness
  {
    id: 'supplement-bottle-clinical',
    title: 'Supplement Clinical',
    description: 'Clinical white-on-white supplement bottle with capsules',
    image: supplementBottleClinical,
    prompt: `Ultra-realistic clinical product photograph of the product — a {productType} bottle — standing on a pure white acrylic surface, a small cluster of capsules arranged in a neat arc beside it. Crisp high-key lighting from a large overhead softbox, subtle soft shadow, color-accurate label in sharp focus, clean trustworthy pharmaceutical aesthetic, shot at 85mm f/8 ISO 100, 8K resolution, premium {productType} brand advertising.`,
  },
  {
    id: 'vitamin-gummy-jar-kitchen',
    title: 'Vitamin Gummy Kitchen',
    description: 'Open gummy jar with lifestyle kitchen morning scene',
    image: vitaminGummyJarKitchen,
    prompt: `Photorealistic lifestyle product shot of the product — a {productType} gummy jar with the lid off — on a light oak kitchen counter, a few colorful gummies spilled beside it, morning sunlight streaming through a window creating soft warm highlights, a blurred ceramic mug of coffee in the background, shallow depth of field at 50mm f/2.8, warm cheerful {productType} mood, color-accurate label, shot ratio 4:5, 8K resolution.`,
  },
  {
    id: 'protein-tub-gym',
    title: 'Protein Tub Gym',
    description: 'Protein tub on rubber gym floor with dramatic light',
    image: proteinTubGym,
    prompt: `Hyper-realistic dramatic product photograph of the product — a protein powder tub — placed on a textured black rubber gym floor, a scoop of powder resting beside it with a small cloud of dust frozen mid-air. Hard directional side light creating long bold shadows, dark moody gradient background, rim light on the tub edge, muscular high-performance aesthetic, color-accurate label, shot at 35mm f/5.6, 8K resolution, premium sports {productType} ad.`,
  },
  {
    id: 'collagen-powder-pastel',
    title: 'Collagen Pastel',
    description: 'Minimalist collagen jar with soft pastel palette',
    image: collagenPowderPastel,
    prompt: `Minimalist product photograph of the product — a collagen powder jar — centered on a soft blush-pink seamless backdrop, a small neat spoonful of fine powder resting on a round ceramic disc beside it. Clean diffused daylight from above, gentle soft shadow, warm pastel palette, calm feminine {productType} mood, color-accurate label, shot at 85mm f/5.6 ISO 100, shot ratio 4:5, 8K resolution, premium clean-{productType} ad.`,
  },
  {
    id: 'electrolyte-sachet-beach',
    title: 'Electrolyte Beach',
    description: 'Electrolyte sachet on sand with ocean backdrop',
    image: electrolyteSachetBeach,
    prompt: `Ultra-realistic lifestyle product photograph of the product — an electrolyte sachet — resting on pale golden sand beside a frosty glass of water with fresh lemon and ice. Soft focus turquoise ocean waves in the distant background, warm late-morning sunlight, tiny water droplets on the glass, fresh hydrating summery mood, shot at 50mm f/2.8, shot ratio 4:5, color-accurate label, 8K resolution, premium hydration brand advertising.`,
  },
  {
    id: 'greens-powder-splash',
    title: 'Greens Powder Splash',
    description: 'Greens scoop with vibrant green powder splash mid-air',
    image: greensPowderSplash,
    prompt: `Hyper-realistic high-speed product photograph of the product — a greens powder tub — with a scoop suspended mid-air releasing a dynamic vivid green powder burst frozen in motion. Fresh spinach and mint leaves scattered nearby, clean white studio backdrop, bright diffused overhead light plus a crisp side rim, ultra-sharp focus on the tub, color-accurate label, shot at 85mm f/8, 8K resolution, premium {productType} ad.`,
  },
  {
    id: 'melatonin-bedside-night',
    title: 'Melatonin Bedside',
    description: 'Sleep supplement on nightstand in moody lamp light',
    image: melatoninBedsideNight,
    prompt: `Photorealistic moody lifestyle product photograph of the product — a sleep {productType} bottle — on a dark wood nightstand beside a softly lit linen-shaded lamp, a folded book and a small plant in the blurred background. Deep warm amber lamp glow as the only light source, rich shadows, calm restful night-time atmosphere, shallow depth of field at 50mm f/1.8, color-accurate label, shot ratio 4:5, 8K resolution, premium sleep {productType} ad.`,
  },
  {
    id: 'omega3-capsules-macro',
    title: 'Omega-3 Macro',
    description: 'Translucent capsules with golden fish-oil sheen',
    image: omega3CapsulesMacro,
    prompt: `Ultra-macro product photograph of the product — an omega-3 {productType} bottle — with a small cluster of translucent amber capsules arranged in the foreground catching light so the golden fish-oil inside glows. Clean soft-gradient neutral background, crisp overhead softbox lighting with a subtle warm rim, extreme texture detail on the capsule surface, color-accurate label, shot at 100mm macro f/5.6, 8K resolution, premium {productType} brand editorial.`,
  },
  {
    id: 'probiotic-botanical-clean',
    title: 'Probiotic Botanical',
    description: 'Probiotic bottle with botanicals and clean-science mood',
    image: probioticBotanicalClean,
    prompt: `Ultra-realistic clean-science product photograph of the product — a probiotic bottle — on a pale sage-green matte surface, fresh botanicals (thyme sprig, a single eucalyptus leaf) and a small clear petri-dish prop arranged nearby. Soft even daylight from above, precise soft shadows, calm modern biotech aesthetic, color-accurate label in sharp focus, shot at 85mm f/5.6 ISO 100, shot ratio 4:5, 8K resolution, premium gut-{productType} brand ad.`,
  },

  // Beauty — additional 2026 editorial prompts
  {
    id: 'retinol-serum-acrylic',
    title: 'Retinol Acrylic',
    description: 'Retinol serum on frosted acrylic with sharp drop shadow',
    image: retinolSerumAcrylic,
    prompt: `Ultra-realistic premium {productType} product photograph of the product — a retinol serum bottle — standing on a frosted acrylic block, hard directional key light from 45° upper-left casting a crisp long drop shadow across the surface, soft warm fill on the opposite side. Muted peach gradient background, color-accurate amber liquid visible through glass, editorial dermatological aesthetic, shot at 85mm f/8, 8K resolution, 2026 clinical-luxe {productType} ad.`,
  },
  {
    id: 'sunscreen-poolside-tropical',
    title: 'Sunscreen Poolside',
    description: 'Sunscreen bottle on tile edge with pool reflections',
    image: sunscreenPoolsideTropical,
    prompt: `Hyper-realistic sun-drenched product photograph of the product — a sunscreen bottle — resting on a turquoise-tiled pool edge, tiny water droplets beading on the label, soft caustic light reflections from the water dancing on the tile. A folded striped beach towel blurred in the background, bright midday tropical sunlight, color-accurate label sharp in focus, shot at 35mm f/4, shot ratio 4:5, 8K resolution, premium 2026 {productType} ad.`,
  },
  {
    id: 'lipstick-duo-editorial',
    title: 'Lipstick Duo Editorial',
    description: 'Two lipsticks in sculptural still-life composition',
    image: lipstickDuoEditorial,
    prompt: `Ultra-realistic editorial still-life photograph of the product — two luxury lipstick tubes — arranged sculpturally, one standing upright and one laying at a precise diagonal, casting sharp intersecting shadows on a warm taupe textured plaster surface. Hard spotlight from upper-right, deep contrast, rich saturated bullet color visible on one uncapped tube, color-accurate metallic case finish, shot at 100mm macro f/8, 8K resolution, 2026 high-{productType} editorial.`,
  },
  {
    id: 'fragrance-dark-smoke',
    title: 'Fragrance Smoke',
    description: 'Moody fragrance ad with swirling smoke and rim light',
    image: fragranceDarkSmoke,
    prompt: `Cinematic ultra-realistic {productType} product photograph of the product — a luxury perfume bottle with richly colored liquid — centered against a deep black backdrop with wisps of atmospheric smoke curling around it. Strong cold rim lights from left and right defining the glass silhouette, a single warm accent highlight on the cap, glossy reflections, sensual moody aesthetic, color-accurate liquid, shot at 85mm f/5.6, 8K resolution, 2026 premium {productType} campaign.`,
  },
  {
    id: 'mens-grooming-marble',
    title: 'Men’s Grooming Marble',
    description: 'Grooming product on dark marble shelf with brass accents',
    image: mensGroomingMarble,
    prompt: `Photorealistic masculine {productType} product photograph of the product on a dark veined marble shelf, a brushed-brass shaving accessory and a small folded dark linen cloth styled nearby. Moody warm overhead light with strong side shadow, restrained luxurious barbershop aesthetic, color-accurate label, crisp reflections on the marble, shot at 50mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium men’s {productType} brand ad.`,
  },
  {
    id: 'hair-oil-silk-drip',
    title: 'Hair Oil Silk',
    description: 'Hair oil bottle with golden drip over flowing silk',
    image: hairOilSilkDrip,
    prompt: `Ultra-realistic {productType} product photograph of the product — a hair oil bottle — tilted slightly with a slow golden viscous drip falling onto a softly flowing champagne-colored silk fabric below, the silk catching the drip and creating a glossy pooled sheen. Warm rim backlight making the oil glow translucent, rich editorial color palette, extreme texture detail, color-accurate label, shot at 100mm macro f/5.6, 8K resolution, 2026 luxury {productType} campaign.`,
  },

  // Lifestyle — additional modern scenes
  {
    id: 'tech-wfh-desk',
    title: 'Tech WFH Desk',
    description: 'Warm walnut desk with tech product in use scene',
    image: techWfhDesk,
    prompt: `Photorealistic modern work-from-home lifestyle photograph of the product on a warm walnut desk, a partially blurred laptop, a ceramic pour-over coffee setup, and a small trailing plant styled around it. Soft directional morning window light, warm neutral palette, crisp focus on the product, shallow depth of field at 35mm f/2.8, color-accurate label, 2026 cozy-tech aesthetic, shot ratio 4:5, 8K resolution.`,
  },
  {
    id: 'kitchen-gadget-in-use',
    title: 'Kitchen Gadget In Use',
    description: 'Kitchen gadget with hands mid-prep and fresh ingredients',
    image: kitchenGadgetInUse,
    prompt: `Ultra-realistic lifestyle product photograph of the product — a kitchen gadget — being used by hands (no face visible) mid-prep on a light marble countertop, fresh ingredients (herbs, produce, a wooden board) arranged naturally around it. Bright diffused window light, authentic cooking moment with subtle motion, color-accurate product, shallow depth of field at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium kitchenware brand ad.`,
  },
  {
    id: 'backpack-travel-editorial',
    title: 'Backpack Travel',
    description: 'Backpack in-use on a cinematic travel location',
    image: backpackTravelEditorial,
    prompt: `Cinematic editorial travel photograph of the product — a backpack — worn from behind by a person walking down a cobblestone European street at golden hour, no face shown, soft lens flare, warm painterly color grade, crisp texture detail on the pack straps and fabric, shallow depth of field at 35mm f/2.8, color-accurate product, shot ratio 4:5, 8K resolution, 2026 aspirational travel brand campaign.`,
  },

  // Cinematic — additional high-impact shots
  {
    id: 'liquid-pour-frozen-splash',
    title: 'Liquid Pour Frozen',
    description: 'Product frozen mid-splash inside a liquid pour',
    image: liquidPourFrozenSplash,
    prompt: `Ultra-cinematic hyper-realistic high-speed product photograph of the product suspended mid-air inside a perfectly frozen cascading liquid pour, crown-shaped droplets exploding around it, liquid ribbon wrapping the product. Dark gradient backdrop, dramatic twin rim lights carving the liquid edges, razor-sharp focus on the product, shot at 100mm macro f/11 with strobe flash freezing motion, 8K resolution, 2026 premium advertising style.`,
  },
  {
    id: 'luxury-watch-volcanic',
    title: 'Luxury Watch Volcanic',
    description: 'Watch on black volcanic rock with spotlight',
    image: luxuryWatchVolcanic,
    prompt: `Hyper-realistic luxury product photograph of the product — a high-end watch — resting on jagged black volcanic rock, a single hard spotlight from upper-right carving out deep dramatic shadows across the texture. Deep black void background, crisp specular highlights on the watch case and dial, color-accurate dial detail, shot at 100mm macro f/11, 8K resolution, 2026 premium horology campaign.`,
  },
  {
    id: 'earbuds-wet-neon',
    title: 'Earbuds Wet Neon',
    description: 'Earbuds on wet reflective surface with neon glow',
    image: earbudsWetNeon,
    prompt: `Cinematic ultra-realistic product photograph of the product — wireless earbuds in their case — on a wet reflective obsidian surface with colorful neon sign glow (cyan and magenta) reflecting beneath. Thin film of water creating mirror reflections, shallow puddle ripples, moody nighttime tech aesthetic, crisp product edges, color-accurate finish, shot at 50mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium consumer-tech ad.`,
  },

  // Food & Drink — restaurant, beverage, CPG food
  {
    id: 'restaurant-hero-overhead',
    title: 'Restaurant Hero',
    description: 'Overhead plated dish on dark wood with styled sides',
    image: restaurantHeroOverhead,
    prompt: `Ultra-realistic overhead {productType} photograph of the product — a hero plated dish — centered on a dark walnut table, styled with linen napkin, brass cutlery, a sprig of fresh herbs, and a small side ramekin. Moody directional window light from upper-left, rich contrast, color-accurate {productType} textures, glistening highlights on sauce and garnish, shallow depth of field at 50mm f/4, shot ratio 1:1, 8K resolution, 2026 premium restaurant editorial.`,
  },
  {
    id: 'latte-art-macro',
    title: 'Latte Art Macro',
    description: 'Close-up ceramic mug with silky rosetta latte art',
    image: latteArtMacro,
    prompt: `Ultra-macro coffee photograph of the product — a ceramic mug — filled to the brim with a silky rosetta latte art pattern, fine microfoam detail, a single loose coffee bean resting on the saucer. Warm directional window light, soft steam curling above the surface, muted cream and espresso palette, shallow depth of field at 100mm macro f/2.8, shot ratio 4:5, 8K resolution, 2026 specialty-coffee brand editorial.`,
  },
  {
    id: 'cocktail-splash-hero',
    title: 'Cocktail Splash',
    description: 'Coupe glass with citrus twist and frozen splash',
    image: cocktailSplashHero,
    prompt: `Hyper-realistic high-speed {productType} photograph of the product — a coupe cocktail glass — with a citrus twist frozen mid-drop creating a sculpted splash crown, tiny droplets suspended in the air around it. Deep amber liquid with crystal-clear ice sphere, dark moody backdrop with rim light sculpting the glass, color-accurate garnish, shot at 100mm macro f/8, 8K resolution, 2026 premium spirits campaign.`,
  },
  {
    id: 'pizza-cheese-pull',
    title: 'Pizza Cheese Pull',
    description: 'Hand lifting a slice with dramatic cheese pull',
    image: pizzaCheesePull,
    prompt: `Ultra-realistic action {productType} photograph of the product — a pizza — with a single slice being lifted by a hand (no face visible), a dramatic cheese pull stretching between slice and pie, crisp leopard-spotted crust visible. Dark rustic wood board, warm directional overhead spotlight, steam rising, vibrant color-accurate toppings, shallow depth of field at 50mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium pizzeria ad.`,
  },
  {
    id: 'burger-stack-hero',
    title: 'Burger Stack Hero',
    description: 'Side-on hero burger stack with glistening condiments',
    image: burgerStackHero,
    prompt: `Hyper-realistic side-on {productType} photograph of the product — a signature burger stack — with precisely layered patty, melted cheese, crisp lettuce, tomato, and a glossy toasted brioche bun, condiments catching the light. Soft warm backlight creating a subtle glow around edges, neutral warm backdrop, tiny sesame seeds tack-sharp, shallow depth of field at 85mm f/4, shot ratio 1:1, 8K resolution, 2026 premium burger brand campaign.`,
  },
  {
    id: 'dessert-macro-plated',
    title: 'Dessert Macro',
    description: 'Plated dessert with glossy sauce and gold leaf',
    image: dessertMacroPlated,
    prompt: `Ultra-macro dessert photograph of the product — a plated dessert … with glossy chocolate sauce pooling elegantly, fine gold leaf accents, fresh berries glistening, and a dusting of powdered sugar. Dark textured ceramic plate, moody side window light with crisp highlights, color-accurate hues, shallow depth of field at 100mm macro f/4, shot ratio 4:5, 8K resolution, 2026 fine-dining editorial.`,
  },
  {
    id: 'beverage-fridge-condensation',
    title: 'Beverage Condensation',
    description: 'Chilled can/bottle with heavy condensation beads',
    image: beverageFridgeCondensation,
    prompt: `Ultra-realistic {productType} product photograph of the product — a chilled can or bottle — covered in heavy fresh condensation beads, ice cubes and a few frosted droplets scattered around the base. Deep gradient color backdrop matching the brand hue, crisp rim lighting sculpting the product edges, color-accurate label, shot at 85mm f/8 ISO 100, shot ratio 4:5, 8K resolution, 2026 premium {productType} campaign.`,
  },
  {
    id: 'chocolate-bar-reveal',
    title: 'Chocolate Bar Reveal',
    description: 'Chocolate bar half unwrapped with snap break',
    image: chocolateBarReveal,
    prompt: `Hyper-realistic macro {productType} photograph of the product — a premium chocolate bar — half-unwrapped from its foil, one square snapped off revealing a clean break edge with visible texture, cocoa nibs and a dusting of cocoa scattered nearby. Warm moody studio light, rich dark backdrop, color-accurate deep brown tones, shallow depth of field at 100mm macro f/4, shot ratio 4:5, 8K resolution, 2026 luxury confection campaign.`,
  },

  // Fashion — apparel, footwear, accessories
  {
    id: 'sneaker-studio-hero',
    title: 'Sneaker Studio Hero',
    description: 'Single sneaker floating with sculpted shadow',
    image: sneakerStudioHero,
    prompt: `Ultra-realistic hero sneaker product photograph of the product — a single sneaker — suspended mid-air at a dynamic 3/4 angle on a bold saturated color backdrop, precise sculpted drop shadow on the ground plane below. Crisp rim lighting carving out silhouette and midsole, color-accurate materials, every stitch and lace detail tack-sharp, shot at 85mm f/11, shot ratio 4:5, 8K resolution, 2026 premium {productType} campaign.`,
  },
  {
    id: 'handbag-pedestal-editorial',
    title: 'Handbag Pedestal',
    description: 'Luxury handbag on marble pedestal in warm light',
    image: handbagPedestalEditorial,
    prompt: `Ultra-realistic luxury {productType} product photograph of the product — a designer handbag — placed on a round travertine pedestal against a warm peach plaster backdrop. Soft directional window light from the left casting a long painterly shadow, hardware highlights catching the light, color-accurate leather texture in crisp focus, shot at 85mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium luxury {productType} editorial.`,
  },
  {
    id: 'apparel-flatlay-editorial',
    title: 'Apparel Flat Lay Editorial',
    description: 'Curated outfit flat lay on textured paper',
    image: apparelFlatlayEditorial,
    prompt: `Ultra-realistic overhead editorial flat-lay of the product styled with a complete curated outfit — folded knitwear, denim, a leather belt, small gold jewelry, and a pair of minimalist shoes — arranged on warm stone-colored textured paper. Soft even daylight, precise spacing, subtle cast shadows, color-accurate fabric textures, shot at 35mm f/8, shot ratio 1:1, 8K resolution, 2026 premium {productType} editorial.`,
  },
  {
    id: 'model-jacket-no-face',
    title: 'Jacket On-Body',
    description: 'Torso shot wearing jacket, no face, editorial',
    image: modelJacketNoFace,
    prompt: `Photorealistic {productType} product photograph of the product — a tailored jacket — worn on a model shown from the shoulders to hips, no face visible, shot against a concrete grey studio cyc. Soft cinematic side light with gentle shadow falloff, natural fabric drape, color-accurate textile detail, shallow depth of field at 85mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium {productType} editorial campaign.`,
  },
  {
    id: 'jewelry-velvet-hero',
    title: 'Jewelry Velvet Hero',
    description: 'Fine jewelry on deep velvet with controlled speculars',
    image: jewelryVelvetHero,
    prompt: `Ultra-macro luxury {productType} product photograph of the product — a fine {productType} piece — arranged elegantly on a deep emerald velvet surface, soft pin-lights carving out controlled specular highlights on every stone and metal facet. Rich color palette, mirror-clean gem detail, moody darker backdrop, shot at 100mm macro f/11 focus-stacked, shot ratio 1:1, 8K resolution, 2026 premium fine-{productType} editorial.`,
  },
  {
    id: 'sunglasses-glow-studio',
    title: 'Sunglasses Glow',
    description: 'Sunglasses with colored gradient backlight glow',
    image: sunglassesGlowStudio,
    prompt: `Ultra-realistic eyewear product photograph of the product — sunglasses — floating against a punchy gradient backdrop (sunset orange to magenta), soft colored glow radiating behind the frame. Crisp rim light sculpting the frame and lens edges, color-accurate lens tint, fine frame texture detail, shot at 100mm macro f/8, shot ratio 4:5, 8K resolution, 2026 premium eyewear campaign.`,
  },
  {
    id: 'watch-dial-macro-luxury',
    title: 'Watch Dial Macro',
    description: 'Top-down luxury watch dial with precision detail',
    image: watchDialMacroLuxury,
    prompt: `Ultra-macro luxury horology photograph of the product — a fine watch — shot straight-down on a slate-grey brushed-metal surface, dial perfectly centered, hands aligned to 10:10. Precise focus-stacked crispness across dial, indices, and bezel, controlled specular highlights on the case, deep shadows around the edges, color-accurate dial tones, shot at 100mm macro f/16, shot ratio 1:1, 8K resolution, 2026 premium watch brand editorial.`,
  },
  {
    id: 'hat-wall-minimalist',
    title: 'Hat Wall Minimalist',
    description: 'Hat hung on peg against textured plaster wall',
    image: hatWallMinimalist,
    prompt: `Photorealistic minimalist {productType} product photograph of the product — a hat — hung on a simple brass peg against a warm cream plaster wall with visible trowel texture. Soft raking daylight from the left casting a long gentle shadow, subtle natural fabric texture, color-accurate tones, shot at 50mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium {productType} brand editorial.`,
  },
  {
    id: 'sneaker-street-action',
    title: 'Sneaker Street Action',
    description: 'Mid-stride street sneaker shot with motion blur',
    image: sneakerStreetAction,
    prompt: `Ultra-realistic street {productType} photograph of the product — sneakers — captured mid-stride on wet city pavement, the stepping shoe sharp and the trailing shoe slightly motion-blurred, reflections on the wet surface catching neon signage glow. Moody evening lighting with cold ambient and warm accent, color-accurate materials, crisp tread detail, shot at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium streetwear campaign.`,
  },

  // Home & Decor — interior, ambient, decor products
  {
    id: 'candle-ambient-living',
    title: 'Candle Ambient',
    description: 'Lit candle on coffee table with cozy living room',
    image: candleAmbientLiving,
    prompt: `Ultra-realistic home decor product photograph of the product — a lit candle — on a stone coffee table, warm flickering flame, softly blurred linen sofa and bouclé throw behind. Evening ambient light with a golden bulb glow, deep cozy shadows, color-accurate vessel finish, shallow depth of field at 50mm f/1.8, shot ratio 4:5, 8K resolution, 2026 premium home-{productType} brand editorial.`,
  },
  {
    id: 'throw-pillow-sofa-styled',
    title: 'Throw Pillow Sofa',
    description: 'Styled throw pillow on linen sofa with morning light',
    image: throwPillowSofaStyled,
    prompt: `Photorealistic home decor lifestyle photograph of the product — a throw pillow — styled on a natural linen sofa with a thick knit throw casually draped nearby, a small stack of coffee-table books on the side. Soft morning window light from the right, warm neutral palette, crisp color-accurate fabric texture, shallow depth of field at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium home-textile brand ad.`,
  },
  {
    id: 'rug-modern-living-room',
    title: 'Rug Modern Room',
    description: 'Rug in a modern living room with architectural light',
    image: rugModernLivingRoom,
    prompt: `Ultra-realistic wide interior photograph of the product — an area rug — laid in a modern living room with a sculptural bouclé chair, a small ceramic side table, and a tall arched window on the right casting long architectural light streaks across the rug. Warm neutral palette, crisp weave texture detail, color-accurate pile, shot at 24mm f/5.6, shot ratio 16:9, 8K resolution, 2026 premium home-decor brand editorial.`,
  },
  {
    id: 'vase-flowers-still-life',
    title: 'Vase Still Life',
    description: 'Ceramic vase with seasonal florals on plaster backdrop',
    image: vaseFlowersStillLife,
    prompt: `Photorealistic editorial still-life photograph of the product — a ceramic vase — holding a loose, asymmetric arrangement of seasonal florals and branches on a warm plaster-textured backdrop. Soft directional window light from the left, long painterly shadow, color-accurate glaze and floral tones, shallow depth of field at 85mm f/4, shot ratio 4:5, 8K resolution, 2026 premium home-goods brand editorial.`,
  },
  {
    id: 'tableware-set-dining',
    title: 'Tableware Set',
    description: 'Ceramic dish set styled on linen dining table',
    image: tablewareSetDining,
    prompt: `Ultra-realistic overhead product photograph of the product — a ceramic tableware set — styled elegantly on a wrinkled natural linen tablecloth with brass flatware, woven placemats, and a small floral centerpiece. Soft diffused overhead daylight, precise spacing, color-accurate glaze tones, subtle textural highlights, shot at 35mm f/8, shot ratio 1:1, 8K resolution, 2026 premium tabletop brand editorial.`,
  },
  {
    id: 'bedding-minimal-bedroom',
    title: 'Bedding Minimal',
    description: 'Made bed with layered linen in serene bedroom',
    image: beddingMinimalBedroom,
    prompt: `Photorealistic interior lifestyle photograph of the product — a bedding set — layered on a platform bed in a serene minimalist bedroom, softly wrinkled sheets and neatly folded throw at the foot, a single wooden stool with a book and ceramic cup nearby. Soft morning light filtering through linen curtains, warm neutral palette, crisp fabric texture, shot at 35mm f/4, shot ratio 4:5, 8K resolution, 2026 premium bedding brand editorial.`,
  },

  // Pet — food, treats, toys, accessories
  {
    id: 'pet-food-bowl-kitchen',
    title: 'Pet Food Bowl',
    description: 'Pet food bowl on wood floor with blurred dog',
    image: petFoodBowlKitchen,
    prompt: `Ultra-realistic pet lifestyle photograph of the product — a {productType} kibble or wet food — freshly scooped into a ceramic bowl on a warm oak floor, a soft-focus dog or cat partially visible in the background approaching the bowl. Warm morning kitchen light, cozy inviting mood, color-accurate {productType} texture and bowl finish, shallow depth of field at 35mm f/2.8, shot ratio 4:5, 8K resolution, 2026 premium {productType} brand campaign.`,
  },
  {
    id: 'pet-treat-pouch-studio',
    title: 'Pet Treat Studio',
    description: 'Treat pouch with treats arranged and playful pet prop',
    image: petTreatPouchStudio,
    prompt: `Photorealistic studio product photograph of the product — a {productType} pouch — standing upright on a soft pastel backdrop with a small neat pile of treats scattered in front, a plush toy bone or tennis ball styled nearby. Soft diffused lighting with a warm rim, color-accurate packaging, tack-sharp treat texture, shot at 85mm f/5.6, shot ratio 4:5, 8K resolution, 2026 premium {productType} brand ad.`,
  },
  {
    id: 'pet-collar-flatlay',
    title: 'Pet Collar Flat Lay',
    description: 'Collar and leash flat lay with natural props',
    image: petCollarFlatlay,
    prompt: `Ultra-realistic overhead product photograph of the product — a {productType} collar and matching leash — arranged in a clean loose curve on a warm oat-colored linen surface, a small brass ID tag, a tiny sprig of greenery, and a rolled leather lead styled nearby. Soft even daylight, subtle cast shadows, color-accurate materials, shot at 50mm f/8, shot ratio 1:1, 8K resolution, 2026 premium {productType} brand editorial.`,
  },

  // Concept / Scroll-Stopping — playful, clean, single-concept shots
  {
    id: 'jelly-cubes-squeeze',
    title: 'Jelly Cubes Squeeze',
    description: 'Product nestled between wobbly pastel jelly cubes',
    image: jellyCubesSqueeze,
    prompt: `Photorealistic commercial product shot of the product centered and gently pressed between two oversized glossy wobbly jelly cubes in soft pastel hues (mint green and blush pink). Jelly cubes compress slightly against the product with a tactile squish, glossy translucent surfaces catching studio light with subtle internal highlights. Ultra-clean bright studio {productType} lighting, smooth specular highlights, soft contact shadow beneath. Clean pastel gradient background, minimal distraction-free composition, playful premium social-media aesthetic, 8K resolution, shot ratio 1:1, 2026 scroll-stopping ad energy.`,
  },
  {
    id: 'whipped-cream-dollop',
    title: 'Whipped Cream Dollop',
    description: 'Product emerging from a fluffy whipped cream swirl',
    image: whippedCreamDollop,
    prompt: `Hyper-realistic {productType} product photograph of the product rising playfully out of the center of a perfect swirl of glossy whipped cream, a single glossy red cherry resting on top beside it. Whipped cream texture tack-sharp with visible peaks and creamy folds, soft diffused overhead studio light, subtle reflections on the product, clean pale-pink pastel gradient background, airy indulgent feel, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium playful product advertising.`,
  },
  {
    id: 'balloon-trio-float',
    title: 'Balloon Trio Float',
    description: 'Three pastel balloons holding product aloft',
    image: balloonTrioFloat,
    prompt: `Ultra-realistic playful commercial product shot of the product suspended mid-air, lifted by three glossy helium balloons in soft pastel hues (peach, lilac, mint) with delicate thin strings trailing down. Clean pastel sky-blue gradient background, bright even studio lighting, crisp specular highlights on balloon surfaces, color-accurate product label, sharp product focus, shot ratio 1:1, 8K resolution, 2026 premium social-media product ad.`,
  },
  {
    id: 'macaron-stack-pedestal',
    title: 'Macaron Pedestal',
    description: 'Product standing on a neat stack of pastel macarons',
    image: macaronStackPedestal,
    prompt: `Photorealistic {productType} product photograph of the product standing elegantly on top of a precise stack of five pastel-colored French macarons (rose, pistachio, vanilla, lavender, peach). Macarons show tack-sharp almond texture and delicate ruffled feet, clean pale-pink gradient background, bright diffused overhead studio light, soft even shadow beneath the stack, color-accurate product label, shot ratio 1:1, 8K resolution, 2026 premium feminine social advertising.`,
  },
  {
    id: 'pastel-bubble-wrap-pop',
    title: 'Bubble Wrap Pop',
    description: 'Product on pastel bubble wrap with popped bubbles',
    image: pastelBubbleWrapPop,
    prompt: `Ultra-realistic playful product photograph of the product placed flat on a sheet of oversized pastel-tinted bubble wrap (soft lilac-to-mint gradient), a few bubbles clearly popped flat around the product while the others remain plump. Bright clean studio lighting creating crisp highlights on every bubble, subtle shadow under the product, minimal distraction-free composition, color-accurate label, shot ratio 1:1, 8K resolution, 2026 scroll-stopping social-media ad.`,
  },
  {
    id: 'sprinkles-burst-cloud',
    title: 'Sprinkles Burst',
    description: 'Product inside a vibrant cloud of frozen pastel sprinkles',
    image: sprinklesBurstCloud,
    prompt: `Hyper-realistic high-speed product photograph of the product centered in the frame with a vibrant cloud of pastel-colored sprinkles frozen mid-explosion around it, individual sprinkles suspended in the air in a playful expressive burst. Clean white-to-blush gradient background, bright crisp studio lighting with soft side rim, sharp focus on product, tack-sharp sprinkle detail, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium playful product campaign.`,
  },
  {
    id: 'marshmallow-nest',
    title: 'Marshmallow Nest',
    description: 'Product resting in a soft pile of pastel marshmallows',
    image: marshmallowNest,
    prompt: `Ultra-realistic {productType} product photograph of the product nestled into a soft mound of oversized pastel marshmallows in pale pink, white, and mint green. Plush pillowy surfaces with tack-sharp sugar-dusted texture, bright clean studio lighting with gentle shadow beneath, airy cozy-yet-premium feel, clean pastel gradient background, color-accurate label, shot ratio 1:1, 8K resolution, 2026 playful premium social advertising.`,
  },
  {
    id: 'latex-glove-hold',
    title: 'Latex Glove Hold',
    description: 'Glossy pastel latex glove cupping the product',
    image: latexGloveHold,
    prompt: `Photorealistic commercial product shot of a single glossy inflated pastel-pink latex glove holding the product upright in a playful cupping gesture, each fingertip slightly rounded with a subtle highlight. Clean pastel peach gradient background, bright even studio lighting, crisp specular highlights on the glossy glove surface, sharp color-accurate product label, minimal composition with strong single-concept focus, shot ratio 1:1, 8K resolution, 2026 scroll-stopping social {productType} ad.`,
  },
  {
    id: 'confetti-paper-rain',
    title: 'Confetti Paper Rain',
    description: 'Product under a shower of frozen pastel paper confetti',
    image: confettiPaperRain,
    prompt: `Ultra-realistic high-speed product photograph of the product placed centrally with a celebratory cascade of pastel paper confetti falling and frozen mid-air around it — soft pinks, mints, creams, and gold flecks. Clean pastel gradient backdrop, bright crisp studio lighting with soft side rim, tack-sharp edges on every confetti piece, sharp focus on product, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium playful social-media product ad.`,
  },
  {
    id: 'soap-bubble-sphere',
    title: 'Soap Bubble Sphere',
    description: 'Product floating inside a translucent iridescent soap bubble',
    image: soapBubbleSphere,
    prompt: `Hyper-realistic {productType} product photograph of the product suspended inside a perfectly round translucent soap bubble, iridescent rainbow-tinted swirls dancing across the bubble surface. A few smaller bubbles floating nearby, clean pastel sky gradient background, bright clean studio lighting, razor-sharp focus on product through the bubble with subtle refraction, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium dreamy product ad.`,
  },
  {
    id: 'silk-ribbon-twirl',
    title: 'Silk Ribbon Twirl',
    description: 'Pastel silk ribbons twirling elegantly around the product',
    image: silkRibbonTwirl,
    prompt: `Photorealistic luxury product photograph of the product centered with two or three glossy pastel silk ribbons (blush pink, champagne, pale lilac) gracefully twirling and swirling around it in mid-air, captured frozen in elegant motion. Clean pastel cream gradient background, soft diffused studio lighting with subtle rim light, tack-sharp ribbon sheen, color-accurate product label, shot ratio 1:1, 8K resolution, 2026 premium feminine {productType} editorial.`,
  },
  {
    id: 'melted-wax-pool-dip',
    title: 'Melted Wax Dip',
    description: 'Product half-dipped in a glossy pastel wax pool',
    image: meltedWaxPoolDip,
    prompt: `Ultra-realistic commercial product shot of the lower third of the product submerged in a glossy pool of melted pastel-pink wax, with smooth wax drips trailing down its sides and frozen mid-fall. Clean pastel cream backdrop, bright clean studio lighting, sharp specular highlights on the wax surface, tack-sharp drip detail, color-accurate product label sharp above the wax line, shot ratio 1:1, 8K resolution, 2026 playful premium {productType} advertising.`,
  },
  {
    id: 'tulle-veil-drape',
    title: 'Tulle Veil Drape',
    description: 'Product veiled by soft pastel tulle with gentle folds',
    image: tulleVeilDrape,
    prompt: `Photorealistic editorial product photograph of the product with a soft billowing layer of pale pink tulle gently draped and lifted above it, catching the light and creating delicate organic folds around the product. Clean pastel ivory background, soft diffused studio lighting with a warm rim, the product sharp and centered beneath the sheer fabric, color-accurate label, airy romantic feel, shot ratio 1:1, 8K resolution, 2026 premium feminine {productType} ad.`,
  },
  {
    id: 'paint-swatch-halo',
    title: 'Paint Swatch Halo',
    description: 'Product at center of a circular halo of pastel paint dabs',
    image: paintSwatchHalo,
    prompt: `Ultra-realistic overhead product photograph of the product placed precisely in the center of a tidy circular halo of thick glossy pastel paint dabs in a gradient of colors (blush, peach, mint, lavender, cream) on a clean white surface. Bright clean studio lighting from above, tack-sharp paint texture with visible brushstroke peaks, subtle soft shadow under product, color-accurate label, shot ratio 1:1, 8K resolution, 2026 creative colorful social-media product ad.`,
  },
  {
    id: 'memory-foam-cradle',
    title: 'Memory Foam Cradle',
    description: 'Product pressed into a soft pastel foam cushion',
    image: memoryFoamCradle,
    prompt: `Photorealistic {productType} product photograph of the product pressed gently into a soft pastel-pink memory-foam cushion, the foam molded perfectly around the product base in a clean shallow crater. Bright clean studio lighting from above, tack-sharp foam surface texture, subtle soft shadow, airy weightless premium feel, clean pastel gradient background, color-accurate label, shot ratio 1:1, 8K resolution, 2026 premium cushion-soft {productType} ad.`,
  },
];

// Category assignment by prompt id — grouped so re-categorization is easy.
const categoryMap: Record<PromptCategory, string[]> = {
  packshot: [
    // Amazon Main Image (White Seamless)
    'product-mirror-selfie',
    'amazon-packshot',
    'footwear-packshot',
    'apparel-flatlay',
    'beauty-bottle',
    'skincare-jar',
    'retail-box',
    'ceramic-mug',
    'backpack-packshot',
    'steel-bottle',
    'toy-figurine',
    // Specialty / Challenging (all studio white bg)
    'jewelry-diffusion',
    'glass-bottle-backlit',
    'textile-macro',
    'white-on-white',
    'cosmetics-swatches',
  ],
  food: [
    'restaurant-hero-overhead',
    'latte-art-macro',
    'cocktail-splash-hero',
    'pizza-cheese-pull',
    'burger-stack-hero',
    'dessert-macro-plated',
    'beverage-fridge-condensation',
    'chocolate-bar-reveal',
  ],
  fashion: [
    'sneaker-studio-hero',
    'handbag-pedestal-editorial',
    'apparel-flatlay-editorial',
    'model-jacket-no-face',
    'jewelry-velvet-hero',
    'sunglasses-glow-studio',
    'watch-dial-macro-luxury',
    'hat-wall-minimalist',
    'sneaker-street-action',
  ],
  home: [
    'candle-ambient-living',
    'throw-pillow-sofa-styled',
    'rug-modern-living-room',
    'vase-flowers-still-life',
    'tableware-set-dining',
    'bedding-minimal-bedroom',
  ],
  pet: ['pet-food-bowl-kitchen', 'pet-treat-pouch-studio', 'pet-collar-flatlay'],
  lifestyle: [
    'headphones-desk',
    'shoe-pavement',
    'skincare-bathroom',
    'coffee-mug-kitchen',
    'backpack-hook',
    'knife-cutting-board',
    'yoga-mat-studio',
    'watch-wrist',
    'sunglasses-towel',
    'bottle-fridge',
    // Additional modern lifestyle scenes
    'tech-wfh-desk',
    'kitchen-gadget-in-use',
    'backpack-travel-editorial',
  ],
  beauty: [
    // Beauty / Cosmetics Social Media
    'hand-held-beauty',
    'skincare-routine-flatlay',
    'cosmetics-water-float',
    'beauty-glow-shot',
    // Skincare
    'serum-dropper-macro',
    'cream-jar-texture-swirl',
    'skincare-water-stone',
    'skincare-scrub-explosion',
    'face-mask-squeeze',
    'moisturizer-dewy-skin',
    'skincare-vanity-shelfie',
    // Makeup
    'lipstick-bullet-macro',
    'foundation-swatch-skin',
    'eyeshadow-palette-scatter',
    'mascara-wand-closeup',
    'blush-compact-shatter',
    'makeup-brush-powder-burst',
    'lip-gloss-drip',
    // Fragrance
    'perfume-dark-woody',
    'perfume-floral-petals',
    'perfume-meadow-fantasy',
    'perfume-mist-spray',
    // Hair & Body
    'shampoo-pour-silk',
    'body-oil-golden-pour',
    'bath-bomb-fizz',
    // Nail & Accessories
    'nail-polish-drip',
    'nail-polish-spill-art',
    'jewelry-on-skin',
    // Beauty Lifestyle & Social
    'beauty-bathroom-steam',
    'beauty-hand-apply',
    'beauty-mirror-reflection',
    'beauty-silk-fabric',
    'beauty-ice-cold',
    'beauty-citrus-splash',
    'beauty-honey-drizzle',
    'beauty-rose-petals-bath',
    'beauty-cotton-cloud',
    'beauty-aloe-gel',
    // Additional 2026 editorial beauty
    'retinol-serum-acrylic',
    'sunscreen-poolside-tropical',
    'lipstick-duo-editorial',
    'fragrance-dark-smoke',
    'mens-grooming-marble',
    'hair-oil-silk-drip',
    // Concept / scroll-stopping (softer editorial)
    'whipped-cream-dollop',
    'macaron-stack-pedestal',
    'marshmallow-nest',
    'soap-bubble-sphere',
    'silk-ribbon-twirl',
    'melted-wax-pool-dip',
    'tulle-veil-drape',
    'memory-foam-cradle',
  ],
  health: [
    'supplement-bottle-clinical',
    'vitamin-gummy-jar-kitchen',
    'protein-tub-gym',
    'collagen-powder-pastel',
    'electrolyte-sachet-beach',
    'greens-powder-splash',
    'melatonin-bedside-night',
    'omega3-capsules-macro',
    'probiotic-botanical-clean',
  ],
  social: [
    'ig-feed-square',
    'ig-story-vertical',
    'ig-carousel-hook',
    'tiktok-vertical-hook',
    'fb-meta-ad-cta',
    'pinterest-vertical-pin',
    'ad-4x5-headline',
    'ugc-iphone-look',
    'daily-5-flatlay',
    'hero-banner-landscape',
    'before-after-vertical-ad',
    'aspirational-hand-hold',
    'trendy-shelfie-vertical',
    'reel-cover-minimal',
    // Concept / scroll-stopping (bolder single-concept)
    'jelly-cubes-squeeze',
    'balloon-trio-float',
    'pastel-bubble-wrap-pop',
    'sprinkles-burst-cloud',
    'latex-glove-hold',
    'confetti-paper-rain',
    'paint-swatch-halo',
  ],
  cinematic: [
    // Dynamic / Splash
    'beverage-splash-explosion',
    'fruit-splash-product',
    'coffee-pour-commercial',
    // Levitation / Zero-Gravity
    'product-levitation',
    'ingredient-explosion',
    'floating-luxury',
    // Luxury / Editorial
    'luxury-perfume-editorial',
    'premium-serum-macro',
    'luxury-flat-lay',
    'marble-pedestal',
    // Texture / Material Hero
    'plush-fabric-render',
    'chrome-prismatic',
    'frosted-glass-product',
    // Grid / Lookbook
    'nine-panel-product-grid',
    'before-after-split',
    // Additional cinematic
    'liquid-pour-frozen-splash',
    'luxury-watch-volcanic',
    'earbuds-wet-neon',
  ],
  nature: [
    // Nature / Organic
    'forest-floor-product',
    'botanical-garden',
    'fantasy-meadow',
    // Seasonal / Themed Social
    'summer-vibes-product',
    'cozy-winter-product',
    'spring-fresh-product',
  ],
};

const idToCategory: Record<string, PromptCategory> = {};
for (const [cat, ids] of Object.entries(categoryMap) as [PromptCategory, string[]][]) {
  for (const id of ids) idToCategory[id] = cat;
}

export const prompts: Prompt[] = rawPrompts.map((p) => {
  const category = idToCategory[p.id];
  if (!category) {
    throw new Error(`Prompt "${p.id}" is missing a category assignment in categoryMap.`);
  }
  return { ...p, category };
});
