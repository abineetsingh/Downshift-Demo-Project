import type { NormalizedProduct, SearchResult } from "./types";

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

export function tokenize(value: string) {
  return normalize(value)
    .split(/[^a-z0-9&]+/)
    .filter(Boolean);
}

function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_unused, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[a.length][b.length];
}

function tokenMatch(queryToken: string, fieldToken: string) {
  if (fieldToken === queryToken) return 1;
  if (fieldToken.startsWith(queryToken)) return 0.86;
  if (fieldToken.includes(queryToken)) return 0.64;
  if (queryToken.length < 4) return 0;

  const limit = queryToken.length <= 7 ? 1 : 2;
  return editDistance(queryToken, fieldToken) <= limit ? 0.72 : 0;
}

function fieldScore(queryTokens: string[], text: string, weight: number) {
  const fieldTokens = tokenize(text);
  if (fieldTokens.length === 0) return 0;

  return queryTokens.reduce((sum, queryToken) => {
    const best = Math.max(0, ...fieldTokens.map((fieldToken) => tokenMatch(queryToken, fieldToken)));
    return sum + best * weight;
  }, 0);
}

export function qualityScore(item: NormalizedProduct) {
  const rating = item.rating ?? 0;
  const reviews = Math.log10(item.reviews + 1);
  return rating * 2 + reviews + (item.inStock ? 0.35 : 0);
}

export function scoreItem(item: NormalizedProduct, query: string): SearchResult | null {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return { item, score: qualityScore(item), directScore: 0 };
  }

  const titleScore = fieldScore(queryTokens, item.title, 9);
  const brandScore = fieldScore(queryTokens, item.brand, 7);
  const tagScore = fieldScore(queryTokens, [...item.tags, item.category].join(" "), 5);
  const descriptionScore = fieldScore(queryTokens, item.description, 1.5);
  const directScore = titleScore + brandScore + tagScore;

  if (directScore === 0 && descriptionScore === 0) return null;

  const tier = directScore > 0 ? 1000 : 100;
  const score = tier + directScore + descriptionScore + qualityScore(item) / 10;
  return { item, score, directScore };
}

export function searchItems(items: NormalizedProduct[], query: string) {
  return items
    .map((item) => scoreItem(item, query))
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || b.item.reviews - a.item.reviews);
}
