export type ProductType =
  | 'beauty'
  | 'skincare'
  | 'health'
  | 'supplement'
  | 'fashion'
  | 'apparel'
  | 'footwear'
  | 'food'
  | 'beverage'
  | 'home'
  | 'pet'
  | 'tech'
  | 'other';

export interface ProductTypeDef {
  id: ProductType;
  label: string;
}

export const productTypes: ProductTypeDef[] = [
  { id: 'beauty', label: 'Beauty' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'health', label: 'Health' },
  { id: 'supplement', label: 'Supplement' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'food', label: 'Food' },
  { id: 'beverage', label: 'Beverage' },
  { id: 'home', label: 'Home' },
  { id: 'pet', label: 'Pet' },
  { id: 'tech', label: 'Tech' },
  { id: 'other', label: 'Product' },
];

export const DEFAULT_PRODUCT_TYPE_WORD = 'product';

/**
 * Replace `{productType}` tokens in a prompt body with the word describing the
 * product's niche. Falls back to "product" when no type is supplied or when the
 * type is `other`.
 */
export function renderPrompt(promptText: string, productType?: string | null): string {
  const word = productType && productType !== 'other' ? productType : DEFAULT_PRODUCT_TYPE_WORD;
  return promptText.replace(/\{productType\}/g, word);
}
