/**
 * Search text normalization for partial-match queries (bill names and friends):
 * lower case and accent-insensitive, so "acai" finds "Açaí" and "CINEMA" finds
 * "cinema à tarde". Used both when indexing candidates and when building the
 * needle, since Dexie has no collation-aware index to lean on.
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/**
 * Predicate testing whether an entity's `name` contains the term, ignoring case
 * and accents. Callers must skip blank terms (an empty needle would match
 * every name anyway) and list everything instead.
 */
export function buildNameMatcher<T extends { name?: unknown }>(term: string): (item: T) => boolean {
  const needle = normalizeForSearch(term);
  return (item) => typeof item.name === 'string' && normalizeForSearch(item.name).includes(needle);
}
