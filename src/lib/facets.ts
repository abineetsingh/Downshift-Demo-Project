import type { CatalogVocabulary, FacetFamily, NormalizedProduct } from "./types";

export const MATERIAL_TAGS = [
  "bamboo",
  "brass",
  "canvas",
  "ceramic",
  "glass",
  "leather",
  "linen",
  "marble",
  "oak",
  "rattan",
  "steel",
  "terracotta",
  "velvet",
  "walnut",
  "wool",
];

export const STYLE_TAGS = [
  "brushed",
  "compact",
  "faceted",
  "folding",
  "hand-thrown",
  "handwoven",
  "hanging",
  "low",
  "matte",
  "minimal",
  "modern",
  "sculptural",
  "stackable",
  "triptych",
  "vintage",
  "wide",
];

export const PRODUCT_TYPE_TAGS = [
  "bar",
  "basket",
  "bath",
  "bench",
  "bin",
  "blanket",
  "board",
  "bookend",
  "bookstand",
  "bowl",
  "box",
  "can",
  "canister",
  "carafe",
  "chair",
  "cover",
  "crate",
  "decor",
  "dish",
  "doormat",
  "furniture",
  "holder",
  "hook",
  "kitchen",
  "lamp",
  "lantern",
  "light",
  "lighting",
  "mat",
  "mirror",
  "mug",
  "office",
  "organizer",
  "outdoor",
  "planter",
  "poster",
  "print",
  "rack",
  "rug",
  "runner",
  "sconce",
  "sideboard",
  "storage",
  "stool",
  "table",
  "textiles",
  "towel",
  "tray",
  "tumbler",
  "unit",
  "vase",
  "wall art",
];

const FACET_DEFINITIONS: Record<FacetFamily, string[]> = {
  materials: MATERIAL_TAGS,
  styles: STYLE_TAGS,
  productTypes: PRODUCT_TYPE_TAGS,
};

export function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase())
    .replace(/\bAnd\b/g, "&");
}

export function normalizeTerm(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function displayFacet(value: string) {
  return titleCase(value);
}

export function getItemFacets(tags: string[], title: string) {
  const normalizedTags = tags.map(normalizeTerm);
  const normalizedTitle = normalizeTerm(title);

  return Object.fromEntries(
    (Object.keys(FACET_DEFINITIONS) as FacetFamily[]).map((family) => [
      family,
      FACET_DEFINITIONS[family].filter(
        (tag) =>
          normalizedTags.includes(tag) ||
          normalizedTitle.split(/\b/).join(" ").includes(tag),
      ),
    ]),
  ) as Record<FacetFamily, string[]>;
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function buildVocabulary(items: NormalizedProduct[]): CatalogVocabulary {
  return {
    brands: uniqueSorted(items.map((item) => item.brand)),
    categories: uniqueSorted(items.map((item) => item.category)),
    productTypes: PRODUCT_TYPE_TAGS,
    materials: MATERIAL_TAGS,
    styles: STYLE_TAGS,
  };
}

export function vocabularyTerms(vocabulary: CatalogVocabulary) {
  return uniqueSorted([
    ...vocabulary.brands,
    ...vocabulary.categories,
    ...vocabulary.productTypes.map(displayFacet),
    ...vocabulary.materials.map(displayFacet),
    ...vocabulary.styles.map(displayFacet),
  ]);
}
