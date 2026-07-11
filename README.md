# Downshift Demo Product Architecture

## Overview

![Curio black banner](branding/curio-banner-dark.png)

Curio is a client-side product discovery experience built with Next.js. The app loads a cleaned product catalog from JSON, then runs search, filtering, sorting, and UI state updates in the browser for fast interactions.

The following is some of the core product components with high level implementation details and reference to parts of the codebase where they reside. The design inspiration was taken from analyzing modern ecommerce sites like Fabletics and Nike which have thorough searching and realtime product discovery flows within their catalogue.

The code base was developed using Claude and Codex using some custom skills I have acquired and have been experimenting with. The docs folder will have some of the brainstorming sessions were generated from the conversational elements in the requirements elicitation and discovery phase before the product code was generated and iterated upon. Post development features have been examined, tested and adjusted based off personal preferenecs. 

## Data Source

### What Is Used

- Source: `data/products.json`
- Catalog loading/normalization: `src/lib/catalog.ts`

### Why

- The JSON file already contains the product data needed by the UI.
- Loading once on the server keeps the implementation simple.
- Client-side search is fast enough for the catalog size.

## Data Cleaning And Formatting

### File

- `src/lib/catalog.ts`

### What Gets Removed

Products are omitted before reaching the client if they have:

- Missing image: `image === null`
- Broken image host: `cdn.catalog.example`
- Missing/null price: parsed price is `null`
- Zero price: parsed price is exactly `0`

These omitted products do not appear in:

- Main product grid
- Search results
- Filtered results
- Search overlay featured results
- Trending products

### What Gets Normalized

- Titles are trimmed and title-cased.
- Extra title whitespace is collapsed.
- String prices like `"1,081.43"` become `1081.43`.
- Numeric prices pass through.
- `null` prices parse as `null`, then the product is omitted.
- Ratings stay `number | null`.
- `releasedAt` is parsed into `releasedAtMs` for sorting.
- Tags are trimmed and lowercased.
- Missing descriptions become an empty string.
- Missing image dimensions get defaults.

## Search Feature

### Files

- Search scoring: `src/lib/search.ts`
- Filter composition: `src/lib/filter.ts`
- Sorting: `src/lib/sort.ts`
- UI owner: `src/components/discovery-page.tsx`

### Why

Search is custom because the app needs product-specific ranking:

- Product title should matter most.
- Brand and product taxonomy should matter more than description.
- Description should work as a fallback, not dominate results.
- Typo tolerance should be lightweight and dependency-free.

### How Search Works

The search algorithm:

- Lowercases query text.
- Splits query into tokens.
- Scores each product in memory.
- Rejects products with no matching field.
- Sorts matching products by score.

### Field Weights

Higher weight means the field is more important:

- Title: `9`
- Brand: `7`
- Tags/category: `5`
- Description: `1.5`

### Match Types

The scorer supports:

- Exact token matches
- Prefix matches while typing
- Contains matches
- Typo tolerance with edit distance

### Ranking Boosts

After text matching, results get a small quality boost from:

- Rating
- Review count
- In-stock status

### Description Fallback

Direct matches in title, brand, tags, or category outrank description-only matches.

This prevents a product that merely mentions a word in marketing copy from beating a product whose actual name or taxonomy matches the query.

## Filters

### File

- `src/lib/filter.ts`

### Available Filters

- Category
- Product type
- Material
- Style
- Brand
- Price range
- Rating threshold
- Availability / stock

### How Filters Combine

- Multiple selected values inside one filter family use OR.
- Different filter families combine with AND.

Example:

- Material: Oak or Rattan
- Category: Storage

Means:

- `(Oak OR Rattan) AND Storage`

### Facet Counts

Facet counts show how many products would match each option.

Zero-count options can be disabled instead of hidden.

## Facets And Categorization

### Files

- Facet mapping: `src/lib/facets.ts`
- Types: `src/lib/types.ts`

### Categories

The product catalog has ten top-level categories:

- Bath
- Decor
- Furniture
- Kitchen
- Lighting
- Office
- Outdoor
- Storage
- Textiles
- Wall Art

### Facet Families

Raw tags are mapped into:

- Materials
- Styles
- Product types

### Title Fallback

Facet membership checks:

1. Product tags
2. Normalized title

This lets a product with `Oak` in the title match the Oak material filter even if the raw tag is missing.

## Chips

### File

- `src/components/filter-bar.tsx`

### What Chips Are

Chips are visible active-filter badges.

Example:

```text
[Oak x] [Under $800 x] [Norlund x]
```

### Why

Chips make filtering transparent:

- Users can see which filters are active.
- Users can remove one filter at a time.
- The UI avoids mystery search state.

### Checkbox vs Chip

- Checkbox: input control used to select a filter.
- Chip: visible badge shown after a filter is active.

## Sorting

### File

- `src/lib/sort.ts`

### Sort Options

- Most Relevant
- Newest
- Best Sellers / reviews
- Top Rated
- Price: Low to High
- Price: High to Low

### Missing Values

Products with missing sort fields are placed last for that sort.

Examples:

- No rating: last in Top Rated

Null-price products are omitted before sorting, so they do not need price-sort fallback behavior.

## Search Overlay

### Files

- Overlay UI: `src/components/search-overlay.tsx`
- Recent searches: `src/lib/recent-searches.ts`
- Header/search input: `src/components/header.tsx`

### Empty Search State

When the search bar is focused with no query:

- Recent Searches shows latest three searches.
- Trending Searches shows top three vocabulary terms.
- Trending Products shows products ranked by `rating * reviews`.

### Typing State

When the user types:

- Recommended Searches shows up to three prefix suggestions.
- Featured Results shows top product matches for the live query.

### Product Cards In Overlay

Overlay product cards show only:

- Product image
- Item name

They do not show:

- Brand
- Price
- Rating
- Review count

## Main Product Grid

### Files

- Grid: `src/components/results-grid.tsx`
- Product card: `src/components/product-card.tsx`

### Behavior

- Responsive grid
- Four columns on desktop
- Incremental rendering in batches
- Product image uses fixed aspect ratio
- Product cards include metadata in the main grid

### Main Grid Card Metadata

Main product cards can show:

- Product image
- Product title
- Brand
- Price, if present
- Rating/reviews, if present
- Out-of-stock badge

## URL State

### File

- `src/lib/url-state.ts`

### Why

URL state makes discovery shareable and restorable.

### What Is Serialized

- Query
- Category
- Brand
- Product type
- Material
- Style
- Price
- Rating
- Availability
- Sort

## Current High Level Implementations

- Prominent search field
- Product/category/brand/material/style search coverage
- Faceted filters
- Active filter chips
- Sorting
- Visual product grid
- Custom relevance ranking

## Suggested Future Enhancements

- Grouped autocomplete sections for Products, Brands, Categories, Materials, Styles
- Advanced no-results recovery with relaxed filters and close matches
- Test suite for search/filter/url helpers, some bugs with filter permutations on invalid products
- Product checkout and add to cart flows/pages
- Manage favorites flows
- Authentication
- Traditional ecommerce page elements i.e store locations, about page, contact etc.
- Better product images that are not clipped
- Home banner can be a slideshow of other images - similar to Nike home page with auto scrolling
- Production grade deployment with CICD on cloud infra (Vercel + Supabase or AWS) depending on user scale
