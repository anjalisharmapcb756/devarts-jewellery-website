export type JewelleryType =
  | "Rings"
  | "Earrings"
  | "Necklaces"
  | "Bracelets"
  | "Engagement Rings"
  | "Wedding Jewellery"
  | "Men's Jewellery";

export type Gemstone =
  | "Diamond"
  | "Emerald"
  | "Ruby"
  | "Sapphire"
  | "Pearl";

export type MetalType = "Yellow Gold" | "White Gold" | "Rose Gold" | "Platinum";
export type Occasion = "Everyday" | "Wedding" | "Anniversary" | "Gifting";

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified?: boolean;
}

export interface ProductSpecifications {
  metalPurity: string;
  metalWeight: string;
  gemstoneWeight: string;
  gemstoneQuality: string;
  setting: string;
  certification: string;
}

export interface ProductOptionPricing {
  metals: Partial<Record<MetalType, number>>;
  gemstones: Partial<Record<Gemstone, number>>;
  gemstoneSizes: Record<string, number>;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  details?: string;
  price: number;
  originalPrice?: number;
  currency: "INR";
  category: JewelleryType;
  jewelleryType: JewelleryType;
  gemstone: Gemstone;
  metal: MetalType;
  occasion: Occasion;
  image: string;
  hoverImage: string;
  images?: string[];
  inStock: boolean;
  badge?: string;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
  specifications?: ProductSpecifications;
  availableMetals?: MetalType[];
  availableGemstones?: Gemstone[];
  gemstoneSizes?: string[];
  ringSizes?: string[];
  optionPricing?: ProductOptionPricing;
  shippingInfo?: string;
  returnPolicy?: string;
}

export interface CartItemSelection {
  metal: MetalType;
  gemstone: Gemstone;
  gemstoneSize: string;
  ringSize?: string;
}

export interface CartItem {
  key: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  selection: CartItemSelection;
}
