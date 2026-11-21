import type { CartItemSelection, Product } from "@/types/product";

export function getUnitPrice(product: Product, selection: CartItemSelection) {
  const pricing = product.optionPricing;
  const metalDelta = pricing?.metals?.[selection.metal] ?? 0;
  const gemstoneDelta = pricing?.gemstones?.[selection.gemstone] ?? 0;
  const sizeDelta = pricing?.gemstoneSizes?.[selection.gemstoneSize] ?? 0;
  return Math.max(0, product.price + metalDelta + gemstoneDelta + sizeDelta);
}

export function getOriginalUnitPrice(product: Product, selection: CartItemSelection) {
  if (!product.originalPrice) return undefined;
  const delta = getUnitPrice(product, selection) - product.price;
  return Math.max(0, product.originalPrice + delta);
}

export function formatSelection(selection: CartItemSelection) {
  return [
    selection.metal,
    selection.gemstone,
    selection.gemstoneSize,
    selection.ringSize,
  ]
    .filter(Boolean)
    .join(" / ");
}