// Hardcoded configuration for the Clone page.
//
// The Clone flow takes a user-uploaded reference image and swaps the
// person in it with one of the user's saved characters — keeping pose,
// clothing, lighting, background, and composition identical. Small
// tweaks (colour changes etc.) can be layered on via the brief.
//
// The reference can be ANY kind of photo — editorial, phone candid,
// film snap, indoor flash pic, low-res social upload. The prompt
// deliberately avoids prescribing a quality level and instead tells the
// model to inherit whatever style, quality, grain, and lighting Image 1
// has. "Editorial" bias would wreck faithful clones of casual shots.
//
// Prompt structure borrows from several production sources:
//   - [REFERENCES] / [RELATIONSHIP] / [TWEAKS] block skeleton — Google's
//     multi-part prompting style (ai.google.dev/gemini-api/docs/image-generation)
//   - `[IDENTITY LOCK]` + "FACE LIKENESS IS THE #1 PRIORITY" convention —
//     meitu/meitu-skills workflows (production skill shipped to real users)
//   - "preserve facial structure / no face morphing / 100% recognizable"
//     idioms — YouMind-OpenLab/awesome-nano-banana-pro-prompts
//   - Fabric / drape language — sanjay3290/ai-skills Imagen examples
//   - Selective attribute transfer + explicit re-lighting direction —
//     calesthio/OpenMontage flux-best-practices multi-reference-editing
//   - Tweak phrasing "Do not change any other element of the image" —
//     Google's canonical multi-turn editing example

export const CLONE_GENERATION_COUNT = 4;
export const CLONE_RESOLUTION = '2K';
export const CLONE_OUTPUT_FORMAT = 'png';

/**
 * Build the prompt sent to Nano Banana Pro for cloning a reference image
 * with a different character inserted.
 *
 * @param tweaks       Optional free-text tweaks (e.g. "change the dress
 *   from black to red"). If the user wants literal text rendered into the
 *   output they should wrap it in double quotes — the model only honours
 *   text when it's quoted.
 * @param aspectRatio  Target output aspect ratio ('1:1', '4:5', etc.).
 */
export function buildClonePrompt(tweaks: string, aspectRatio: string): string {
  const trimmed = tweaks.trim();

  return `Recreate Image 1 with the character from Image 2 onward as the subject instead of the original person. The final image should look like Image 1 but with a different person in it — same place, same time, same camera, same conditions. Output a single ${aspectRatio} photorealistic image that matches Image 1's overall look, quality, and style exactly — whether Image 1 is a studio shot, a phone candid, a film snap, or anything in between.

[REFERENCES]
- Image 1 — SOURCE SCENE (primary anchor, highest weight): ground truth for composition, framing, crop, pose, limb positions, head tilt, weight distribution, camera angle, lens character, focal length, depth of field, lighting direction, lighting colour temperature, shadows, contact shadows, colour palette, colour grade, image grain/noise, overall sharpness or softness, outfit (design, cut, colour, material, drape, folds, creases), background, props, and atmosphere. Inherit the image's style and quality exactly as-is — if it looks like a phone snap, it should still look like a phone snap; if it looks editorial, it should still look editorial.
- Image 2 and onward — CHARACTER (identity anchor): ground truth for the person's face, hairline, hairstyle, hair colour, skin tone, eye shape, eyebrow shape, jawline, facial structure, body proportions, body type, and any distinguishing features (moles, freckles, scars, tattoos). When multiple character images are provided, treat them as different angles of the same person and triangulate a consistent 3D identity.

[IDENTITY LOCK]
FACE LIKENESS IS THE #1 PRIORITY. Preserve exact facial structure, hairline, and facial features from Image 2 onward. The character must be 100% recognizable as the same person shown in Image 2+. No face morphing, no averaging with the original person in Image 1, no beautification, no age change, no expression change beyond what the source scene requires.

[RELATIONSHIP]
- IDENTITY: Take face, hairline, hairstyle, hair colour, skin tone, eye colour, eyebrow shape, jawline, facial structure, body type, and distinguishing features strictly from Image 2 onward.
- SCENE: Take everything else from Image 1 — pose (exact limb positions, hand positions, finger positions, head tilt, gaze direction, weight distribution), outfit (exact design, colour, cut, material, drape, folds, creases, shadows on garment), background, props, framing, crop, camera angle, lens character, depth of field, and overall atmosphere. Do not change any other element of the image.
- BODY ADAPTATION: If the character's body proportions differ from the original person's, adapt the outfit's fit and drape naturally to the character's body while preserving the outfit's design, colour, material, and silhouette exactly. Do not invent a different garment.
- RE-LIGHTING: Re-light the character's face, hair, and skin so the light direction, colour temperature, softness, and shadow placement match Image 1's existing light exactly. The character's face must not look "pasted in" — their shadows, highlights, and any rim light must come from Image 1's light sources. Contact shadows on the ground and against the background must match Image 1's existing shadows in direction, softness, and colour.

[TWEAKS]
${
  trimmed
    ? `Apply the following changes on top of the clone. Do not change any other element of the image:\n${trimmed}`
    : 'None — keep the scene exactly as Image 1, except for the identity swap described above.'
}

Output: ${aspectRatio} aspect ratio, photorealistic. Inherit Image 1's quality level, sharpness, grain, colour grade, and overall look exactly — do not upgrade a casual snap into a polished studio shot, and do not downgrade a polished shot either. Faces rendered accurately, hands with five fingers and natural anatomy, no duplicate people, no extra limbs, no warped hands, no visible AI artifacts, no beauty-filter smoothing unless Image 1 already has it.`;
}
