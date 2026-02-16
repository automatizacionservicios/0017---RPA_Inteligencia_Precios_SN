/**
 * Clasificación de Capacidades de la Tienda
 * Define qué tiendas soportan qué modos de búsqueda (nombre vs EAN)
 */

// Tiendas que NO funcionan con búsqueda por EAN (solo soportan búsqueda por nombre/catálogo)
export const NO_EAN_STORES = [
  'carulla', // Bloqueado por WAF en la API para búsqueda por EAN
  'd1', // Instaleap - Solo nombre según el usuario
  'makro', // Instaleap - Solo nombre según el usuario
  'rappi', // Solicitud del usuario: Solo nombre
];

// Tiendas que soportan búsqueda basada en nombre (Las 17 tiendas)
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
 * Comprueba si una tienda soporta búsqueda basada en nombre
 */
export function canSearchByName(_storeId: string): boolean {
  return true; // Ahora todas las tiendas soportan búsqueda por nombre
}

/**
 * Comprueba si una tienda soporta búsqueda basada en EAN
 */
export function canSearchByEan(storeId: string): boolean {
  return !NO_EAN_STORES.includes(storeId);
}

/**
 * Comprueba si una tienda es solo de nombre (no soporta búsqueda por EAN)
 */
export function isNameOnly(storeId: string): boolean {
  return NO_EAN_STORES.includes(storeId);
}

// Manteniendo la exportación heredada para compatibilidad si se utiliza en otro lugar, pero con lógica invertida
export const isEanOnly = isNameOnly;
