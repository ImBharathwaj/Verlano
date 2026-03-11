export type CartItemDto = {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  size: string;
  productTitle: string;
  productSlug: string;
  productBrand: string;
};

export type CartResponse = {
  cart: { id: string } | null;
  items: CartItemDto[];
  total: number;
};
