export function getUnitPrice(product, selection) {
  const pricing = product?.optionPricing;
  const metalDelta = pricing?.metals?.[selection?.metal] ?? 0;
  const gemstoneDelta = pricing?.gemstones?.[selection?.gemstone] ?? 0;
  const sizeDelta = pricing?.gemstoneSizes?.[selection?.gemstoneSize] ?? 0;
  return Math.max(0, (product?.price ?? 0) + metalDelta + gemstoneDelta + sizeDelta);
}

export function formatPrice(amount, currency = "INR") {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `₹${value.toLocaleString("en-IN")}`;
  }
}
