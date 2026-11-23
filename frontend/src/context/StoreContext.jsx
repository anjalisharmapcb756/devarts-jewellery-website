import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getUnitPrice } from "../lib/pricing";
import { apiFetch } from "../lib/api";
import { CATALOGUE } from "../data/catalogue";

const CART_KEY = "vara-cart";
const WISHLIST_KEY = "vara-wishlist";
const StoreContext = createContext(null);

function isRingCategory(category) {
  return category === "Rings" || category === "Engagement Rings";
}

function defaultSelection(productId, products) {
  const product = products.find((p) => p.id === productId);
  return {
    metal: product?.metal ?? "Yellow Gold",
    gemstone: product?.gemstone ?? "Diamond",
    gemstoneSize: product?.gemstoneSizes?.[0] ?? "1.00 ct",
    ...(isRingCategory(product?.category) ? { ringSize: product?.ringSizes?.[2] ?? "US 7" } : {}),
  };
}

function normalizeSelection(productId, selection, products) {
  const base = defaultSelection(productId, products);
  const merged = { ...base, ...(selection || {}) };
  const product = products.find((p) => p.id === productId);
  if (!isRingCategory(product?.category)) delete merged.ringSize;
  return merged;
}

function selectionKey(productId, selection) {
  return [productId, selection.metal, selection.gemstone, selection.gemstoneSize, selection.ringSize ?? "na"]
    .join("|").toLowerCase().replace(/\s+/g, "-");
}

function buildCartItem(productId, quantity, products, selectionInput, unitPriceInput) {
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  const selection = normalizeSelection(productId, selectionInput, products);
  const unitPrice = unitPriceInput ?? getUnitPrice(product, selection);
  return { key: selectionKey(productId, selection), productId, quantity: Math.max(1, quantity), unitPrice, selection };
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function isKnownProductId(id, extraProducts = []) {
  const value = String(id || "").trim();
  if (!value) return false;
  if (/^[0-9a-fA-F]{24}$/.test(value)) return true;
  if (CATALOGUE.some((p) => p.id === value || p.slug === value)) return true;
  return (extraProducts || []).some((p) => String(p.id) === value || String(p.slug) === value);
}

export function StoreProvider({ children, initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const authedRef = useRef(false);
  const dbSyncedRef = useRef(false);

  useEffect(() => { if (initialProducts?.length) setProducts(initialProducts); }, [initialProducts]);

  useEffect(() => {
    const wishlistRaw = window.localStorage.getItem(WISHLIST_KEY);
    const cartRaw = window.localStorage.getItem(CART_KEY);
    const savedWishlist = safeParse(wishlistRaw, []);
    const savedCart = safeParse(cartRaw, []);
    setWishlist(Array.isArray(savedWishlist) ? savedWishlist.filter((id) => typeof id === "string") : []);
    setCart(Array.isArray(savedCart) ? savedCart
      .filter((i) => i && typeof i.productId === "string" && isKnownProductId(i.productId, initialProducts))
      .map((i) => ({
        key: i.key || `${i.productId}`,
        productId: i.productId,
        quantity: Math.max(1, Number(i.quantity || 1)),
        unitPrice: Number(i.unitPrice || 0),
        selection: i.selection || {},
      })) : []);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    if (authedRef.current && dbSyncedRef.current) apiFetch("/wishlist", { method: "POST", body: JSON.stringify({ items: wishlist }) }).catch(() => {});
  }, [wishlist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (authedRef.current && dbSyncedRef.current) apiFetch("/cart", { method: "POST", body: JSON.stringify({ items: cart }) }).catch(() => {});
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded || dbSyncedRef.current) return;
    (async () => {
      try {
        const me = await apiFetch("/auth/me");
        if (!me?.user) { dbSyncedRef.current = true; return; }
        authedRef.current = true;
        const [cData, wData] = await Promise.all([apiFetch("/cart").catch(() => null), apiFetch("/wishlist").catch(() => null)]);
        const dbCart = (Array.isArray(cData?.items) ? cData.items : []).filter((i) => isKnownProductId(i?.productId, products));
        const dbW = Array.isArray(wData?.items) ? wData.items : [];
        if (dbCart.length > 0) setCart(dbCart);
        else if (cart.length > 0) await apiFetch("/cart", { method: "POST", body: JSON.stringify({ items: cart }) }).catch(() => {});
        if (dbW.length > 0) setWishlist(dbW);
        else if (wishlist.length > 0) await apiFetch("/wishlist", { method: "POST", body: JSON.stringify({ items: wishlist }) }).catch(() => {});
      } catch {}
      dbSyncedRef.current = true;
    })();
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleWishlist = useCallback((id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const addToCart = useCallback((input) => {
    const normalized = typeof input === "string" ? { productId: input } : input;
    const item = buildCartItem(normalized.productId, normalized.quantity ?? 1, products, normalized.selection, normalized.unitPrice);
    if (!item) {
      // fallback when products not loaded
      const fallback = { key: normalized.productId, productId: normalized.productId, quantity: Math.max(1, normalized.quantity ?? 1), unitPrice: Number(normalized.unitPrice || 0), selection: normalized.selection || {} };
      setCart((prev) => {
        const existing = prev.find((c) => c.key === fallback.key);
        if (existing) return prev.map((c) => c.key === fallback.key ? { ...c, quantity: c.quantity + fallback.quantity } : c);
        return [...prev, fallback];
      });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.key === item.key);
      if (existing) return prev.map((c) => c.key === item.key ? { ...c, quantity: c.quantity + item.quantity, unitPrice: item.unitPrice } : c);
      return [...prev, item];
    });
  }, [products]);

  const removeFromCart = useCallback((key) => setCart((prev) => prev.filter((item) => item.key !== key)), []);
  const updateCartQuantity = useCallback((key, quantity) => setCart((prev) => prev.map((item) => item.key === key ? { ...item, quantity: Math.max(0, quantity) } : item).filter((item) => item.quantity > 0)), []);
  const updateCartItem = useCallback((key, updates) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (!existing) return prev;
      const nextQuantity = Math.max(1, updates.quantity ?? existing.quantity);
      const nextSelection = normalizeSelection(existing.productId, { ...existing.selection, ...(updates.selection || {}) }, products);
      const nextKey = selectionKey(existing.productId, nextSelection);
      const product = products.find((p) => p.id === existing.productId);
      const nextUnitPrice = product ? getUnitPrice(product, nextSelection) : existing.unitPrice;
      const updated = { ...existing, key: nextKey, quantity: nextQuantity, selection: nextSelection, unitPrice: nextUnitPrice };
      const withoutCurrent = prev.filter((item) => item.key !== key);
      const duplicate = withoutCurrent.find((item) => item.key === nextKey);
      if (duplicate) return withoutCurrent.map((item) => item.key === nextKey ? { ...item, quantity: item.quantity + updated.quantity, unitPrice: updated.unitPrice } : item);
      return prev.map((item) => (item.key === key ? updated : item));
    });
  }, [products]);
  const moveWishlistToCart = useCallback((productId) => {
    addToCart({ productId, quantity: 1 });
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, [addToCart]);
  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(() => ({
    products, setProducts, wishlist, cart, cartCount: cart.reduce((sum, item) => sum + item.quantity, 0), isLoaded,
    toggleWishlist, addToCart, removeFromCart, updateCartQuantity, updateCartItem, moveWishlistToCart, clearCart,
  }), [products, wishlist, cart, isLoaded, toggleWishlist, addToCart, removeFromCart, updateCartQuantity, updateCartItem, moveWishlistToCart, clearCart]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
