/**
 * Shared category options for shop filtering and admin product forms.
 * Sourced from docs/category.md. Values are stored in DB (lowercase); used for shop filter and product assignment.
 */
export const CATEGORY_OPTIONS = [
  // Legacy / existing (keep for backward compatibility)
  "men",
  "women",
  "pant",
  "shirt",
  "tee",
  "hoodie",
  "accessories",
  "inner",
  "lingerie",
  // Tops
  "t-shirts",
  "shirts",
  "polo-shirts",
  "blouses",
  "tank-tops",
  "crop-tops",
  "sweaters",
  "cardigans",
  "hoodies",
  "sweatshirts",
  "tunics",
  // Bottoms
  "jeans",
  "trousers",
  "chinos",
  "joggers",
  "shorts",
  "skirts",
  "leggings",
  "culottes",
  "cargo-pants",
  // Dresses
  "casual-dresses",
  "maxi-dresses",
  "midi-dresses",
  "mini-dresses",
  "bodycon-dresses",
  "evening-dresses",
  "shirt-dresses",
  "wrap-dresses",
  // Outerwear
  "jackets",
  "coats",
  "blazers",
  "denim-jackets",
  "leather-jackets",
  "bomber-jackets",
  "trench-coats",
  "parkas",
  "windbreakers",
  // Activewear
  "track-pants",
  "gym-t-shirts",
  "sports-shorts",
  "yoga-pants",
  "sports-jackets",
  "training-hoodies",
  "athletic-tops",
  // Loungewear
  "sweatpants",
  "lounge-sets",
  "home-t-shirts",
  "sleepwear",
  "night-suits",
  "robes",
  // Formal wear
  "formal-shirts",
  "formal-trousers",
  "suit-jackets",
  "waistcoats",
  "formal-dresses",
  // Denim
  "denim-shirts",
  "denim-shorts",
  "denim-skirts",
  "denim-jeans",
  // Ethnic wear
  "kurtas",
  "kurtis",
  "ethnic-sets",
  "palazzos",
  "ethnic-jackets",
  // Gender-specific
  "men-t-shirts",
  "men-shirts",
  "men-jeans",
  "men-jackets",
  "men-hoodies",
  "men-shorts",
  "women-tops",
  "women-dresses",
  "women-skirts",
  "women-blazers",
  "women-outerwear",
  "unisex-hoodies",
  "unisex-t-shirts",
  "unisex-sweatshirts",
  // Seasonal
  "summer-essentials",
  "winter-wear",
  "monsoon-wear",
  "holiday-collection",
  "party-wear",
  // Special (landing / marketing)
  "new-arrivals",
  "best-sellers",
  "limited-drops",
  "trending-now",
  "editors-picks",
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

/** Human-readable label for a category value (e.g. "t-shirts" → "T-Shirts") */
export function categoryLabel(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("-");
}
