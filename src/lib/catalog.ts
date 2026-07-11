import "server-only";

import products from "../../data/products.json";
import { getItemFacets, titleCase } from "./facets";
import type { NormalizedProduct, RawProduct } from "./types";

function parsePrice(price: RawProduct["price"]) {
  if (price === null) return null;
  if (typeof price === "number") return Number.isFinite(price) ? price : null;

  const parsed = Number.parseFloat(price.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function hasUsableImage(product: RawProduct) {
  if (!product.image) return false;

  try {
    return new URL(product.image).host !== "cdn.catalog.example";
  } catch {
    return false;
  }
}

export function normalizeProduct(product: RawProduct): NormalizedProduct | null {
  if (!hasUsableImage(product)) return null;

  const title = titleCase(product.title);
  const price = parsePrice(product.price);
  if (price === 0) return null;

  return {
    id: product.id,
    title,
    searchTitle: title.toLowerCase(),
    brand: product.brand.trim(),
    category: product.category.trim(),
    tags: product.tags.map((tag) => tag.trim().toLowerCase()),
    price,
    rating: product.rating,
    reviews: product.reviews,
    inStock: product.inStock,
    releasedAt: product.releasedAt,
    releasedAtMs: Date.parse(product.releasedAt) || 0,
    image: product.image as string,
    imageWidth: product.imageWidth ?? 500,
    imageHeight: product.imageHeight ?? 320,
    description: product.description?.trim() ?? "",
    facets: getItemFacets(product.tags, title),
  };
}

export function loadCatalog() {
  return (products as RawProduct[])
    .map(normalizeProduct)
    .filter((item): item is NormalizedProduct => item !== null);
}
