/**
 * Shared category options for shop filtering and admin product forms.
 * When adding a product, set its category so it appears when that category is selected on the shop page.
 */
export const CATEGORY_OPTIONS = [
  "men",
  "women",
  "pant",
  "shirt",
  "tee",
  "hoodie",
  "accessories",
  "inner",
  "lingerie",
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];
