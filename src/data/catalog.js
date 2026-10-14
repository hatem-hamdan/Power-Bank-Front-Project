export const PRODUCT_NAME = "Keychain Power Bank";

export const PRODUCT_DESCRIPTION =
  "A pocket-sized power bank with built-in Lightning and USB-C cables, a keyring loop for your keys or bag, and an LED flashlight. Available in 2000 mAh and 4000 mAh, in Black or White.";

export const FALLBACK_VARIANTS = [
  { variantID: 0, color: "Black", capacity: "2000 mAh", priceUSD: 24.99, priceGBP: 19.99 },
  { variantID: 0, color: "White", capacity: "2000 mAh", priceUSD: 24.99, priceGBP: 19.99 },
  { variantID: 0, color: "Black", capacity: "4000 mAh", priceUSD: 34.99, priceGBP: 27.99 },
  { variantID: 0, color: "White", capacity: "4000 mAh", priceUSD: 34.99, priceGBP: 27.99 },
];

export const COLOR_SWATCH = {
  Black: "#1c1c1f",
  White: "#f4f4f4",
};

export const HERO_IMAGE = "/images/a.jpg";
export const LIFESTYLE_IMAGE = "/images/l.jpg";
export const GALLERY_IMAGES = ["/images/b.jpg", "/images/d.jpg", "/images/c.jpg"];

export const SHOTS = {
  "Black|2000 mAh": ["/images/a.jpg", "/images/b.jpg", "/media/b2000-real.jpg", "/media/b2000-keys.jpg"],
  "White|2000 mAh": ["/media/w2000.jpg"],
  "Black|4000 mAh": ["/media/p05.jpg", "/media/p09.jpg"],
  "White|4000 mAh": ["/media/w4000.jpg"],
};

export const CLIPS = {
  "Black|2000 mAh": "/media/v-a.mp4",
  "Black|4000 mAh": "/media/hand.mp4",
  "White|4000 mAh": "/media/v-white-4000.mp4",
};

export const NO_VIDEO = "No video available for this version right now.";

export function formatMoney(amount, currency) {
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${Number(amount).toFixed(2)}`;
}

export function unitPrice(variant, currency) {
  if (!variant) {
    return 0;
  }

  return currency === "GBP" ? variant.priceGBP : variant.priceUSD;
}

export function shippingCost(quantity, currency) {
  if (quantity >= 2) {
    return 0;
  }

  return currency === "GBP" ? 5.5 : 7;
}

export function findVariant(variants, color, capacity) {
  return variants.find((variant) => variant.color === color && variant.capacity === capacity) || null;
}

export function galleryFor(color, capacity) {
  const key = `${color}|${capacity}`;
  const own = SHOTS[key];

  if (own && own.length) {
    return { shots: own, note: "" };
  }

  const fallback = SHOTS[`Black|${capacity}`] || [HERO_IMAGE];
  const note = color === "White" ? "Photos show the Black finish." : "";
  return { shots: fallback, note };
}
