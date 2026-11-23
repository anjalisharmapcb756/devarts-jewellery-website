import catalogueJson from "./catalogue.json";

export const CATALOGUE = catalogueJson;
export const CATEGORIES = [...new Set(CATALOGUE.map((p) => p.category))];
export const GEMSTONE_OPTIONS = [...new Set(CATALOGUE.map((p) => p.gemstone))];
export const METAL_OPTIONS = [...new Set(CATALOGUE.map((p) => p.metal))];
export const PRICE_OPTIONS = [
  "Under ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "Above ₹1,00,000",
];

const FALLBACK_SLOTS = 400;

function fallbackImage(slot) {
  const n = (((Math.trunc(slot) - 1) % FALLBACK_SLOTS) + FALLBACK_SLOTS) % FALLBACK_SLOTS + 1;
  return `/images/fallback/${n}.svg`;
}

function fallbackIndex(src) {
  const value = String(src ?? "");
  const match = value.match(/(\d+)/);
  let index;
  if (match) {
    const n = Number(match[1]);
    index = Number.isFinite(n) ? (Math.abs(Math.trunc(n)) - 1 + 100) % 100 : 0;
  } else {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
    }
    index = hash % 100;
  }
  if (/h$/i.test(value)) index += 100;
  return index + 1;
}

export function productFallback(src = "", slot) {
  return Number.isFinite(slot) ? fallbackImage(slot) : fallbackImage(fallbackIndex(src));
}

function isWeakImage(value) {
  const src = String(value || "").trim();
  return !src || src.includes("/images/references/") || src.includes("placeholder");
}

function normalizeApiProduct(p, apiIndex = 0) {
  const key = String(p.slug || p.id || p._id || p.name || "product");
  const mainSlot = 201 + (apiIndex % 100);
  const hoverSlot = 301 + (apiIndex % 100);
  const image = isWeakImage(p.image) ? productFallback(key, mainSlot) : p.image;
  const hoverImage = isWeakImage(p.hoverImage) ? productFallback(`${key}h`, hoverSlot) : p.hoverImage;
  const images = Array.isArray(p.images) && p.images.length
    ? p.images.map((src, i) => (isWeakImage(src) ? (i === 0 ? image : hoverImage) : src))
    : [image, hoverImage];
  let details = p.details;
  if (typeof details === "string") {
    details = details.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  }
  return {
    ...p,
    image,
    hoverImage,
    images,
    details: Array.isArray(details) && details.length ? details : undefined,
    metalOptions: p.metalOptions || p.availableMetals || METAL_OPTIONS,
  };
}

export function mergeCatalogue(apiProducts = []) {
  const list = Array.isArray(apiProducts) ? apiProducts.filter(Boolean).map(normalizeApiProduct) : [];
  const seen = new Set();
  const merged = [];
  for (const p of [...list, ...CATALOGUE]) {
    const key = String(p.slug || p.id || p._id || p.name || Math.random());
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(p);
  }
  return merged;
}
