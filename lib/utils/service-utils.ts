/**
 * Utility for matching catalog entries by PK.
 * Supports exact matches and "Flat" services (pk = null).
 */
export type CatalogEntry = {
  uuid: string;
  nama: string;
  pk: string | null;
  harga: number;
};

export function findBestCatalogMatch(
  selectedPk: string, // Expected to be "0.5", "1", or "1.5-2"
  entries: CatalogEntry[]
): CatalogEntry | undefined {
  if (!entries || entries.length === 0) return undefined;

  // 1. Try exact match for PK
  const exactMatch = entries.find((e) => e.pk === selectedPk);
  if (exactMatch) return exactMatch;

  // 2. Fallback to Flat service (pk is null or empty)
  const flatMatch = entries.find((e) => !e.pk || e.pk === "-");
  if (flatMatch) return flatMatch;

  // 3. Last resort: Return the first entry
  return entries[0];
}

export const STANDARD_PK_OPTIONS = ["0.5", "1", "1.5-2"];
