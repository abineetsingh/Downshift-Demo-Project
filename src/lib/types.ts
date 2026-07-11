export type RawProduct = {
  id: number;
  title: string;
  brand: string;
  category: string;
  tags: string[];
  price: number | string | null;
  rating: number | null;
  reviews: number;
  inStock: boolean;
  releasedAt: string;
  image: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  description: string | null;
};

export type FacetFamily = "productTypes" | "materials" | "styles";

export type NormalizedProduct = {
  id: number;
  title: string;
  searchTitle: string;
  brand: string;
  category: string;
  tags: string[];
  price: number | null;
  rating: number | null;
  reviews: number;
  inStock: boolean;
  releasedAt: string;
  releasedAtMs: number;
  image: string;
  imageWidth: number;
  imageHeight: number;
  description: string;
  facets: Record<FacetFamily, string[]>;
};

export type PriceRange = {
  label: string;
  min?: number;
  max?: number;
};

export type DiscoveryState = {
  query: string;
  category: string;
  brands: string[];
  productTypes: string[];
  materials: string[];
  styles: string[];
  price: string;
  rating: number;
  availability: "all" | "in-stock" | "out-of-stock";
  sort: SortKey;
};

export type SortKey =
  | "relevance"
  | "newest"
  | "best-sellers"
  | "top-rated"
  | "price-low"
  | "price-high";

export type FacetOption = {
  value: string;
  count: number;
  disabled: boolean;
};

export type CatalogVocabulary = {
  brands: string[];
  categories: string[];
  productTypes: string[];
  materials: string[];
  styles: string[];
};

export type SearchResult = {
  item: NormalizedProduct;
  score: number;
  directScore: number;
};
