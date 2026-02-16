/**
 * Store Capabilities Classification
 * Defines which stores support which search modes (name vs EAN)
 */

// Stores that DO NOT work with EAN search (only support name/catalog search)
export const NO_EAN_STORES = [
  'carulla', // WAF blocked on API for EAN search
  'd1', // Instaleap - Name only according to user
  'makro', // Instaleap - Name only according to user
  'rappi', // User request: Name only
];

// Stores that support name-based search (All 17 stores)
export const NAME_SEARCH_STORES = [
  'carulla',
  'jumbo',
  'olimpica',
  'exito',
  'd1',
  'makro',
  'euro',
  'vaquita',
  'megatiendas',
  'mercacentro',
  'zapatoca',
  'nutresa',
  'mundohuevo',
  'farmatodo',
  'mercaldas',
  'supermu',
  'rappi',
];

/**
 * Check if a store supports name-based search
 */
export function canSearchByName(storeId: string): boolean {
  return true; // Now all stores support name search
}

/**
 * Check if a store supports EAN-based search
 */
export function canSearchByEan(storeId: string): boolean {
  return !NO_EAN_STORES.includes(storeId);
}

/**
 * Check if a store is Name-only (doesn't support EAN search)
 */
export function isNameOnly(storeId: string): boolean {
  return NO_EAN_STORES.includes(storeId);
}

// Keeping legacy export for compatibility if used elsewhere, but with inverted logic
export const isEanOnly = isNameOnly;
