"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products as mockProducts } from "@/lib/data/products";
import { getUnitPrice } from "@/lib/pricing";
import type { CartItem, CartItemSelection, Gemstone, MetalType, Product } from "@/types/product";

const CART_KEY = "vara-cart";
const WISHLIST_KEY = "vara-wishlist";

export type AddToCartInput = {
  productId: string;
  quantity?: number;
  unitPrice?: number;
  selection?: Partial<CartItemSelection>;
};

export type UpdateCartItemInput = {
  quantity?: number;
  selection?: Partial<CartItemSelection>;
};

type StoreContextValue = {
  wishlist: string[];
  cart: CartItem[];
  cartCount: number;
  isLoaded: boolean;
  toggleWishlist: (id: string) => void;
  addToCart: (input: string | AddToCartInput) => void;
  removeFromCart: (key: string) => void;
  updateCartQuantity: (key: string, quantity: number) => void;
  updateCartItem: (key: string, updates: UpdateCartItemInput) => void;
  moveWishlistToCart: (productId: string) => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function isRingCategory(category?: string) {
  return category === "Rings" || category === "Engagement Rings";
}

function defaultSelection(productId: string, products: Product[]): CartItemSelection {
  const product = products.find((p) => p.id === productId);
  const metal = (product?.metal ?? "Yellow Gold") as MetalType;
  const gemstone = (product?.gemstone ?? "Diamond") as Gemstone;
  const gemstoneSize = product?.gemstoneSizes?.[0] ?? "1.00 ct";
  const ringSize = isRingCategory(product?.category)
    ? product?.ringSizes?.[2] ?? "US 7"
    : undefined;
  return { metal, gemstone, gemstoneSize, ...(ringSize ? { ringSize } : {}) };
}

function normalizeSelection(productId: string, selection: Partial<CartItemSelection> | undefined, products: Product[]): CartItemSelection {
  const base = defaultSelection(productId, products);
  const merged: CartItemSelection = { ...base, ...selection };
  const product = products.find((p) => p.id === productId);
  if (!isRingCategory(product?.category)) delete merged.ringSize;
  return merged;
}

function selectionKey(productId: string, selection: CartItemSelection) {
  return [productId, selection.metal, selection.gemstone, selection.gemstoneSize, selection.ringSize ?? "na"]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function buildCartItem(productId: string, quantity: number, products: Product[], selectionInput?: Partial<CartItemSelection>, unitPriceInput?: number): CartItem | null {
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  const selection = normalizeSelection(productId, selectionInput, products);
  const unitPrice = unitPriceInput ?? getUnitPrice(product, selection);
  return {
    key: selectionKey(productId, selection),
    productId,
    quantity: Math.max(1, quantity),
    unitPrice,
    selection,
  };
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children, initialProducts }: { children: ReactNode; initialProducts?: Product[] }) {
  const products = initialProducts?.length ? initialProducts : mockProducts;
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const legacyCart = "aurea-cart";
    const legacyWishlist = "aurea-wishlist";
    const wishlistRaw = window.localStorage.getItem(WISHLIST_KEY) ?? window.localStorage.getItem(legacyWishlist);
    const cartRaw = window.localStorage.getItem(CART_KEY) ?? window.localStorage.getItem(legacyCart);

    if (wishlistRaw === null && cartRaw === null) {
      const fallback = buildCartItem("p1", 1, products);
      setWishlist(["p2"]);
      setCart(fallback ? [fallback] : []);
      setIsLoaded(true);
      return;
    }

    const savedWishlist = safeParse<unknown>(wishlistRaw, []);
    const savedCart = safeParse<unknown>(cartRaw, []);

    const validWishlist = Array.isArray(savedWishlist)
      ? savedWishlist.filter((id): id is string => typeof id === "string" && products.some((p) => p.id === id))
      : [];

    const validCart = Array.isArray(savedCart)
      ? savedCart
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const c = item as Partial<CartItem>;
            if (typeof c.productId !== "string") return null;
            return buildCartItem(
              c.productId,
              typeof c.quantity === "number" ? c.quantity : 1,
              products,
              c.selection,
              typeof c.unitPrice === "number" ? c.unitPrice : undefined,
            );
          })
          .filter((item): item is CartItem => Boolean(item))
      : [];

    setWishlist(validWishlist);
    setCart(validCart);
    setIsLoaded(true);
  }, [products]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, isLoaded]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const addToCart = useCallback((input: string | AddToCartInput) => {
    const normalized: AddToCartInput = typeof input === "string" ? { productId: input } : input;
    const item = buildCartItem(
      normalized.productId,
      normalized.quantity ?? 1,
      products,
      normalized.selection,
      normalized.unitPrice,
    );
    if (!item) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.key === item.key);
      if (existing) {
        return prev.map((c) =>
          c.key === item.key ? { ...c, quantity: c.quantity + item.quantity, unitPrice: item.unitPrice } : c,
        );
      }
      return [...prev, item];
    });
  }, [products]);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateCartQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const updateCartItem = useCallback((key: string, updates: UpdateCartItemInput) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (!existing) return prev;
      const nextQuantity = Math.max(1, updates.quantity ?? existing.quantity);
      const nextSelection = normalizeSelection(existing.productId, { ...existing.selection, ...updates.selection }, products);
      const nextKey = selectionKey(existing.productId, nextSelection);
      const product = products.find((p) => p.id === existing.productId);
      const nextUnitPrice = product ? getUnitPrice(product, nextSelection) : existing.unitPrice;
      const updated: CartItem = {
        ...existing,
        key: nextKey,
        quantity: nextQuantity,
        selection: nextSelection,
        unitPrice: nextUnitPrice,
      };

      const withoutCurrent = prev.filter((item) => item.key !== key);
      const duplicate = withoutCurrent.find((item) => item.key === nextKey);
      if (duplicate) {
        return withoutCurrent.map((item) =>
          item.key === nextKey
            ? { ...item, quantity: item.quantity + updated.quantity, unitPrice: updated.unitPrice }
            : item,
        );
      }
      return prev.map((item) => (item.key === key ? updated : item));
    });
  }, [products]);

  const moveWishlistToCart = useCallback((productId: string) => {
    const item = buildCartItem(productId, 1, products);
    if (!item) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.key === item.key);
      if (existing) {
        return prev.map((c) => (c.key === item.key ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, item];
    });
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, [products]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      wishlist,
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      isLoaded,
      toggleWishlist,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      updateCartItem,
      moveWishlistToCart,
      clearCart,
    }),
    [wishlist, cart, isLoaded, toggleWishlist, addToCart, removeFromCart, updateCartQuantity, updateCartItem, moveWishlistToCart, clearCart],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}