/**
 * Definición de cobertura de tiendas.
 * Con la refactorización nacional, todas las tiendas se consideran con cobertura 'national'.
 */
export const STORE_COVERAGE: Record<string, string[]> = {
  carulla: ['national'],
  exito: ['national'],
  jumbo: ['national'],
  olimpica: ['national'],
  euro: ['national'],
  megatiendas: ['national'],
  mercacentro: ['national'],
  nutresa: ['national'],
  zapatoca: ['national'],
  vaquita: ['national'],
  mundohuevo: ['national'],
  farmatodo: ['national'],
  d1: ['national'],
  makro: ['national'],
  mercaldas: ['national'],
  supermu: ['national'],
  rappi: ['national'],
};

/**
 * Retorna las tiendas según la ubicación.
 * Con el nuevo enfoque nacional, simplemente retorna todas las tiendas ignorando el locationId.
 */
export const getStoresByLocation = <T extends { id: string }>(
  stores: T[],
  _locationId: string
): T[] => {
  return stores;
};
