import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getUnitPrice } from "../lib/pricing";
import { apiFetch } from "../lib/api";
import { mergeCatalogue } from "../data/catalogue";

const CART_KEY = "vara-cart";
const WISHLIST_KEY = "vara-wishlist";
const StoreContext = createContext(null);

function isRingCategory(category) {
  return category === "Rings" || category === "Engagement Rings";
}

function productPrice(product) {
  return Number(product?.price ?? product?.price_inr ?? 0);
}

function isPurchasable(product) {
  const stock = Number(product?.stock_quantity ?? product?.stock ?? 1);
  return product && product.is_in_stock !== false && product.isInStock !== false && stock !== 0;
}

function maxQuantity(product) {
  const stock = Number(product?.stock_quantity ?? product?.stock ?? 10);
  return Math.min(20, Math.max(1, Number.isFinite(stock) && stock > 0 ? stock : 10));
}

function defaultSelection(product) {
  return {
    metal: product?.metal ?? "Yellow Gold",
    gemstone: product?.gemstone ?? "Diamond",
    gemstoneSize: product?.gemstoneSizes?.[0] ?? product?.sizes?.[0] ?? "1.00 ct",
    ...(isRingCategory(product?.category) ? { ringSize: product?.ringSizes?.[2] ?? "US 7" } : {}),
  };
}

function normalizeSelection(product, selection) {
  const merged = { ...defaultSelection(product), ...(selection || {}) };
  if (!isRingCategory(product?.category)) delete merged.ringSize;
  return merged;
}

function selectionKey(productId, selection) {
  return [productId, selection.metal, selection.gemstone, selection.gemstoneSize, selection.ringSize ?? "na"]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function buildCartItem(product, quantity, selectionInput) {
  if (!isPurchasable(product)) return null;
  const selection = normalizeSelection(product, selectionInput);
  return {
    key: selectionKey(product.id, selection),
    productId: product.id,
    quantity: Math.min(maxQuantity(product), Math.max(1, Number(quantity) || 1)),
    // Always derive price from live product data so stale localStorage prices cannot survive.
    unitPrice: getUnitPrice({ ...product, price: productPrice(product) }, selection),
    selection,
  };
}

function productIndex(products) {
  const index = new Map();
  for (const product of products || []) {
    const id = String(product?.id ?? product?._id ?? product?.slug ?? "");
    if (!id) continue;
    index.set(id.toLowerCase(), product);
    if (product.slug) index.set(String(product.slug).toLowerCase(), product);
  }
  return index;
}

function findProduct(index, idOrSlug) {
  if (!index) return null;
  return index.get(String(idOrSlug ?? "").trim().toLowerCase()) || null;
}

function normalizeCart(rawItems, products) {
  const index = productIndex(products);
  const items = Array.isArray(rawItems) ? rawItems : [];
  const byKey = new Map();

  for (const raw of items) {
    const product = findProduct(index, raw?.productId ?? raw?.id ?? raw?.slug);
    if (!product) continue;
    const item = buildCartItem(product, raw?.quantity ?? 1, raw?.selection);
    if (!item) continue;
    const existing = byKey.get(item.key);
    if (existing) {
      existing.quantity = Math.min(maxQuantity(product), existing.quantity + item.quantity);
    } else {
      byKey.set(item.key, item);
    }
  }
  return [...byKey.values()];
}

function normalizeWishlist(rawItems, products) {
  const index = productIndex(products);
  const items = Array.isArray(rawItems) ? rawItems : [];
  const ids = [];
  for (const raw of items) {
    const value = typeof raw === "string" ? raw : raw?.productId ?? raw?.id ?? raw?.slug;
    const product = findProduct(index, value);
    if (product) {
      const id = String(product.id ?? product._id ?? product.slug);
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => mergeCatalogue([]));
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const savedCartRef = useRef([]);
  const savedWishlistRef = useRef([]);
  const authedRef = useRef(false);
  const dbSyncedRef = useRef(false);

  useEffect(() => {
    let active = true;
    apiFetch("/products")
      .then((data) => {
        if (!active) return;
        const apiProducts = (data?.products || []).map((product) => ({
          ...product,
          price: productPrice(product),
        }));
        setProducts(mergeCatalogue(apiProducts));
      })
      .catch(() => {
        // The bundled catalogue remains a complete, usable fallback.
      })
      .finally(() => {
        if (active) setProductsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    savedWishlistRef.current = safeParse(window.localStorage.getItem(WISHLIST_KEY), []);
    savedCartRef.current = safeParse(window.localStorage.getItem(CART_KEY), []);
  }, []);

  useEffect(() => {
    if (!productsLoaded) return;
    setCart(normalizeCart(savedCartRef.current, products));
    setWishlist(normalizeWishlist(savedWishlistRef.current, products));
    setIsLoaded(true);
  }, [productsLoaded, products]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    if (authedRef.current && dbSyncedRef.current) {
      apiFetch("/wishlist", { method: "POST", body: JSON.stringify({ items: wishlist }) }).catch(() => undefined);
    }
  }, [wishlist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (authedRef.current && dbSyncedRef.current) {
      apiFetch("/cart", { method: "POST", body: JSON.stringify({ items: cart }) }).catch(() => undefined);
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded || dbSyncedRef.current) return;
    let active = true;
    (async () => {
      try {
        const me = await apiFetch("/auth/me");
        if (!active) return;
        if (!me?.user) {
          dbSyncedRef.current = true;
          return;
        }
        authedRef.current = true;
        const [cartData, wishlistData] = await Promise.all([
          apiFetch("/cart").catch(() => null),
          apiFetch("/wishlist").catch(() => null),
        ]);
        if (!active) return;
        const dbCart = normalizeCart(cartData?.items || [], products);
        const dbWishlist = normalizeWishlist(wishlistData?.items || [], products);
        if (dbCart.length) setCart(dbCart);
        else if (cart.length) await apiFetch("/cart", { method: "POST", body: JSON.stringify({ items: cart }) }).catch(() => undefined);
        if (dbWishlist.length) setWishlist(dbWishlist);
        else if (wishlist.length) await apiFetch("/wishlist", { method: "POST", body: JSON.stringify({ items: wishlist }) }).catch(() => undefined);
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

  const toggleWishlist = useCallback((id) => {
    const value = String(id || "");
    if (!value) return;
    setWishlist((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const addToCart = useCallback((input) => {
    const normalized = typeof input === "string" ? { productId: input } : input || {};
    const index = productIndex(products);
    const product = findProduct(index, normalized.productId);
    const item = product && buildCartItem(product, normalized.quantity ?? 1, normalized.selection);
    if (!item) return false;

    setCart((prev) => {
      const existing = prev.find((entry) => entry.key === item.key);
      if (existing) {
        return prev.map((entry) => (
          entry.key === item.key
            ? { ...entry, quantity: Math.min(maxQuantity(product), entry.quantity + item.quantity), unitPrice: item.unitPrice }
            : entry
        ));
      }
      return [...prev, item];
    });
    return true;
  }, [products]);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateCartQuantity = useCallback((key, quantity) => {
    setCart((prev) => prev.map((item) => {
      if (item.key !== key) return item;
      const product = findProduct(productIndex(products), item.productId);
      const max = product ? maxQuantity(product) : 20;
      return { ...item, quantity: Math.min(max, Math.max(1, Number(quantity) || 1)) };
    }));
  }, [products]);

  const updateCartItem = useCallback((key, updates) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (!existing) return prev;
      const product = findProduct(productIndex(products), existing.productId);
      if (!product) return prev.filter((item) => item.key !== key);

      const selection = normalizeSelection(product, { ...existing.selection, ...(updates.selection || {}) });
      const nextKey = selectionKey(product.id, selection);
      const updated = buildCartItem(product, updates.quantity ?? existing.quantity, selection);
      if (!updated) return prev.filter((item) => item.key !== key);

      const withoutCurrent = prev.filter((item) => item.key !== key);
      const duplicate = withoutCurrent.find((item) => item.key === nextKey);
      if (duplicate) {
        return withoutCurrent.map((item) => (
          item.key === nextKey
            ? { ...item, quantity: Math.min(maxQuantity(product), item.quantity + updated.quantity) }
            : item
        ));
      }
      return [...withoutCurrent, updated];
    });
  }, [products]);

  const moveWishlistToCart = useCallback((productId) => {
    addToCart({ productId, quantity: 1 });
    setWishlist((prev) => prev.filter((item) => item !== String(productId)));
  }, [addToCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(() => ({
    products,
    productsLoaded,
    wishlist,
    cart,
    cartCount: cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    isLoaded,
    toggleWishlist,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartItem,
    moveWishlistToCart,
    clearCart,
  }), [
    products,
    productsLoaded,
    wishlist,
    cart,
    isLoaded,
    toggleWishlist,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartItem,
    moveWishlistToCart,
    clearCart,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
