"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { products as mockProducts } from "@/lib/data/products";
import { getUnitPrice } from "@/lib/pricing";
import type { CartItem, CartItemSelection, Gemstone, MetalType, Product } from "@/types/product";

const CART_KEY = "vara-cart";
const WISHLIST_KEY = "vara-wishlist";
const MAX_QUANTITY = 20;

export type AddToCartInput = {
  productId: string;
  quantity?: number;
  /** Kept for API compatibility. Prices are always derived from live product data. */
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

function findProduct(products: Product[], productId: string) {
  return products.find((p) => p.id === productId || p.slug === productId);
}

function defaultSelection(product: Product | undefined): CartItemSelection {
  const metal = (product?.metal ?? "Yellow Gold") as MetalType;
  const gemstone = (product?.gemstone ?? "Diamond") as Gemstone;
  const gemstoneSize = product?.gemstoneSizes?.[0] ?? "1.00 ct";
  const ringSize = isRingCategory(product?.category)
    ? product?.ringSizes?.[2] ?? "US 7"
    : undefined;
  return { metal, gemstone, gemstoneSize, ...(ringSize ? { ringSize } : {}) };
}

function normalizeSelection(product: Product | undefined, selection: Partial<CartItemSelection> | undefined): CartItemSelection {
  const merged: CartItemSelection = { ...defaultSelection(product), ...selection };
  if (!isRingCategory(product?.category)) delete merged.ringSize;
  return merged;
}

function selectionKey(productId: string, selection: CartItemSelection) {
  return [productId, selection.metal, selection.gemstone, selection.gemstoneSize, selection.ringSize ?? "na"]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function clampQuantity(quantity: unknown) {
  const value = Math.trunc(Number(quantity));
  return Number.isFinite(value) ? Math.min(MAX_QUANTITY, Math.max(1, value)) : 1;
}

function buildCartItem(
  productId: string,
  quantity: number,
  products: Product[],
  selectionInput?: Partial<CartItemSelection>,
): CartItem | null {
  const product = findProduct(products, productId);
  if (!product || product.inStock === false) return null;
  const selection = normalizeSelection(product, selectionInput);
  return {
    key: selectionKey(product.id, selection),
    productId: product.id,
    quantity: clampQuantity(quantity),
    unitPrice: getUnitPrice(product, selection),
    selection,
  };
}

function normalizeCartItems(raw: unknown, products: Product[]): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const byKey = new Map<string, CartItem>();

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<CartItem> & { selection?: Partial<CartItemSelection> };
    if (typeof candidate.productId !== "string") continue;
    const item = buildCartItem(
      candidate.productId,
      candidate.quantity ?? 1,
      products,
      candidate.selection,
    );
    if (!item) continue;

    const existing = byKey.get(item.key);
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + item.quantity);
    } else {
      byKey.set(item.key, item);
    }
  }

  return [...byKey.values()];
}

function normalizeWishlist(raw: unknown, products: Product[]): string[] {
  if (!Array.isArray(raw)) return [];
  const ids = new Set<string>();
  for (const entry of raw) {
    const id = typeof entry === "string"
      ? entry
      : (entry && typeof entry === "object" && "productId" in entry ? String(entry.productId) : "");
    const product = findProduct(products, id);
    if (product) ids.add(product.id);
  }
  return [...ids];
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
  const authedRef = useRef(false);
  const dbSyncedRef = useRef(false);

  useEffect(() => {
    const legacyCart = "aurea-cart";
    const legacyWishlist = "aurea-wishlist";
    const wishlistRaw = window.localStorage.getItem(WISHLIST_KEY) ?? window.localStorage.getItem(legacyWishlist);
    const cartRaw = window.localStorage.getItem(CART_KEY) ?? window.localStorage.getItem(legacyCart);

    setWishlist(normalizeWishlist(safeParse<unknown>(wishlistRaw, []), products));
    setCart(normalizeCartItems(safeParse<unknown>(cartRaw, []), products));
    setIsLoaded(true);
  }, [products]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    if (authedRef.current && dbSyncedRef.current) {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: wishlist }),
      }).catch(() => {});
    }
  }, [wishlist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (authedRef.current && dbSyncedRef.current) {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      }).catch(() => {});
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded || dbSyncedRef.current) return;
    let active = true;
    (async () => {
      try {
        const me = await fetch("/api/auth/me", { cache: "no-store" });
        if (!active) return;
        if (!me.ok) {
          dbSyncedRef.current = true;
          return;
        }
        authedRef.current = true;
        const [cRes, wRes] = await Promise.all([
          fetch("/api/cart", { cache: "no-store" }),
          fetch("/api/wishlist", { cache: "no-store" }),
        ]);
        if (!active) return;

        if (cRes.ok) {
          const cData = await cRes.json();
          const dbCart = normalizeCartItems(cData.items, products);
          if (dbCart.length > 0) setCart(dbCart);
          else if (cart.length > 0) {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: cart }),
            });
          }
        }
        if (wRes.ok) {
          const wData = await wRes.json();
          const dbWishlist = normalizeWishlist(wData.items, products);
          if (dbWishlist.length > 0) setWishlist(dbWishlist);
          else if (wishlist.length > 0) {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: wishlist }),
            });
          }
        }
      } catch {
        // Offline users keep their local cart and wishlist.
      } finally {
        if (active) dbSyncedRef.current = true;
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

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
    );
    if (!item) return;

    setCart((prev) => {
      const existing = prev.find((c) => c.key === item.key);
      if (existing) {
        const product = findProduct(products, item.productId);
        return prev.map((c) => (
          c.key === item.key
            ? { ...c, quantity: Math.min(MAX_QUANTITY, c.quantity + item.quantity), unitPrice: item.unitPrice }
            : c
        ));
      }
      return [...prev, item];
    });
  }, [products]);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateCartQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) => prev.map((item) => (
      item.key === key ? { ...item, quantity: clampQuantity(quantity) } : item
    )));
  }, []);

  const updateCartItem = useCallback((key: string, updates: UpdateCartItemInput) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (!existing) return prev;
      const product = findProduct(products, existing.productId);
      const nextSelection = normalizeSelection(product, { ...existing.selection, ...updates.selection });
      const nextKey = selectionKey(existing.productId, nextSelection);
      const updated = buildCartItem(
        existing.productId,
        updates.quantity ?? existing.quantity,
        products,
        nextSelection,
      );
      if (!updated) return prev.filter((item) => item.key !== key);

      const withoutCurrent = prev.filter((item) => item.key !== key);
      const duplicate = withoutCurrent.find((item) => item.key === nextKey);
      if (duplicate) {
        return withoutCurrent.map((item) => (
          item.key === nextKey
            ? { ...item, quantity: clampQuantity(item.quantity + updated.quantity), unitPrice: updated.unitPrice }
            : item
        ));
      }
      return [...withoutCurrent, updated];
    });
  }, [products]);

  const moveWishlistToCart = useCallback((productId: string) => {
    addToCart({ productId, quantity: 1 });
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, [addToCart]);

  const clearCart = useCallback(() => setCart([]), []);

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
