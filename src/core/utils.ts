/**
 * Utility functions for data processing and formatting.
 */

/**
 * Extracts grammage or volume from a product name string.
 * Preserves the original business logic from the project.
 * @param str The string to extract weight from.
 * @returns The weight in grams/milliliters or null.
 */
export const extractGrams = (str: string): number | null => {
  if (!str) return null;
  // Preserving original Regex from BenchmarkResults.tsx
  const match = str.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gr|ml|kg|oz|lb)\b/i);
  if (match) {
    let value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('k')) value *= 1000;
    return Math.round(value);
  }
  return null;
};

/**
 * Cleans a price string and converts it to a number.
 * Preserves the original business logic from the project.
 * @param price The price string to clean (e.g., "$1.200,00").
 * @returns The numeric value of the price.
 */
export const cleanPrice = (price: string | number | undefined): number => {
  if (price === undefined || price === null) return 0;
  if (typeof price === 'number') return price;

  // Preserving original replace logic from useParetoData.ts
  const cleaned = parseFloat(price.replace(/[$,]/g, ''));
  return isNaN(cleaned) ? 0 : cleaned;
};

/**
 * Formats a number as a localized price string ($1.200).
 * @param price The numeric price.
 * @returns The formatted price string.
 */
export const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null || isNaN(price)) return '---';
  return `$${price.toLocaleString('es-CO')}`;
};
