// Hardcoded configuration for the Create Ads page.
//
// The prompt follows Google's official [REFERENCES] / [RELATIONSHIP] /
// [NEW SCENARIO] framework for Gemini 2.5 / Gemini 3 image models, plus
// the "Identity Lock" phrasing popularised by the Nano Banana Pro prompting
// guide (DeepMind / Google AI Studio, Nov 2025). Gemini 3-family models
// respond best to concise, direct instructions with negative constraints
// placed in a single terminal clause — so the template is kept tight
// (~140 words + brief) and avoids scattered "do not" directives.
//
// References:
//   - https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana
//   - https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/
//   - https://ai.google.dev/gemini-api/docs/gemini-3 (reasoning-model prompting)
//   - https://github.com/ZizheRuan/awesome-nanobanana2 — canonical community prompts

export const CREATE_ADS_GENERATION_COUNT = 4;
export const CREATE_ADS_RESOLUTION = '2K';
export const CREATE_ADS_OUTPUT_FORMAT = 'png';

/**
 * Build the prompt sent to Nano Banana for ad generation.
 *
 * @param productBrief  Free-text brief from the user. Any copy the user wants
 *   rendered verbatim into the image should already be wrapped in double
 *   quotes — the model honours literal text only when quoted.
 * @param aspectRatio   Target output aspect ratio (e.g. '1:1', '4:5'). Even
 *   though fal.ai accepts this as an API parameter, Google's guide
 *   recommends re-stating it in the prompt text for belt-and-suspenders
 *   reliability.
 */
export function buildCreateAdsPrompt(productBrief: string, aspectRatio: string): string {
  const brief = productBrief.trim() || '(no additional context provided)';

  return `Recreate the ad concept from Image 1 as if it had been shot for the product in Image 2 onward. Output a single ${aspectRatio} photorealistic social ad creative, campaign-ready commercial photography quality.

[REFERENCES]
- Image 1 — REFERENCE AD: source for mood, lighting direction and quality, composition, subject framing and scale, camera angle, depth of field, color grading, and prop styling. Infer lens, focal length, and f-stop from this image.
- Image 2+ — USER PRODUCT: ground truth for the product's shape, proportions, colors, label typography, and logo placement.

[RELATIONSHIP]
Keep the product's silhouette, label, colors, and logo exactly the same as Image 2 onward. Match the reference ad's lighting, composition, framing, scale, and color grade. Place the user's product in the same region of the frame that the original product occupies in Image 1.

[NEW SCENARIO]
Adapt background, props, surfaces, and surrounding textures so they are contextually appropriate for the user's product category and the brief below. Props and surfaces are generic and unbranded unless the brief specifies otherwise.

BRIEF (informs scene, props, and any in-image copy):
${brief}

Render any text on the product packaging legibly and spelled correctly. Render ad copy from the brief only when it is enclosed in double quotes — render it verbatim in a font style that matches the reference ad's typography.

Output: ${aspectRatio} aspect ratio, photorealistic, natural shadows and reflections consistent with the inferred light direction. No competitor logos, no watermarks, no text other than what appears on the user's product or is quoted in the brief.`;
}
