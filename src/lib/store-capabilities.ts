/**
 * Store Capabilities Classification
 * Defines which stores support which search modes (name vs EAN)
 */

// Stores that ONLY work with EAN search (no name search support)
export const EAN_ONLY_STORES = [
    'carulla',      // WAF blocked on API
    'd1',           // Instaleap - EAN only
    'makro',        // Instaleap - EAN only
    'berpa',        // DeepLink - EAN only
    'mercadolibre'  // EAN only
];

// Stores that support name-based search
export const NAME_SEARCH_STORES = [
    'jumbo',
    'olimpica',
    'exito',
    'euro',
    'vaquita',
    'megatiendas',
    'mercacentro',
    'zapatoca',
    'nutresa',
    'mundohuevo',
    'farmatodo',
    'mercaldas',
    'supermu'
];

/**
 * Check if a store supports name-based search
 */
export function canSearchByName(storeId: string): boolean {
    return NAME_SEARCH_STORES.includes(storeId);
}

/**
 * Check if a store supports EAN-based search
 * Note: All stores support EAN search
 */
export function canSearchByEan(storeId: string): boolean {
    return true; // All stores support EAN
}

/**
 * Check if a store is EAN-only (doesn't support name search)
 */
export function isEanOnly(storeId: string): boolean {
    return EAN_ONLY_STORES.includes(storeId);
}
