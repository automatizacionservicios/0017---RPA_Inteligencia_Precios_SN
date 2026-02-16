import { useState, useEffect, useMemo } from 'react';
import { canSearchByEan } from '@/lib/store-capabilities';
import { getStoresByLocation } from '@/lib/store-coverage';
import { Store, AdvancedOptions } from '@/types/store';
import { getDefaultStoreList } from '@/lib/store-registry';

/**
 * Hook para gestionar la lista de tiendas para las búsquedas de Benchmark y Radar.
 * Gestiona la selección de tiendas, el filtrado por capacidad (EAN/Nombre) y la cobertura nacional.
 *
 * @param isRadar - Si es true, ignora ciertas exclusiones de tiendas predefinidas (si las hay).
 * @param activeTab - Modo de búsqueda actual ('name' o 'ean') utilizado para filtrar las capacidades de la tienda.
 * @returns Objeto con las tiendas disponibles, manejadores para alternar selección y recuentos.
 */
export const useStoreManagement = (isRadar: boolean, activeTab: string) => {
  useEffect(() => {
    // Limpieza de seguridad de claves de almacenamiento heredadas
    localStorage.removeItem('customBenchmarkStores');
  }, []);

  // Carga la lista de tiendas inicial desde el registro centralizado
  const [stores, setStores] = useState<Store[]>(getDefaultStoreList());

  /**
   * Tiendas visibles en la pestaña actual de la interfaz de usuario.
   * Filtra las tiendas por su capacidad (ej. en modo Nombre todas son visibles; en modo EAN, solo las que soportan EAN).
   */
  const visibleStores = useMemo(() => {
    // Lógica de cobertura nacional centralizada
    const allStores = getStoresByLocation(stores, 'national');

    // Filtrado de capacidad basado en el modo
    if (activeTab === 'name') return allStores;

    // Filtra las tiendas que no soportan búsqueda directa por EAN (ej. D1, Makro)
    return allStores.filter((s) => canSearchByEan(s.id));
  }, [stores, activeTab]);

  /**
   * Tiendas disponibles para interacción (después de aplicar exclusiones específicas).
   */
  const filteredStores = visibleStores; // Simplificado ya que manualStoreIds está actualmente vacío

  /**
   * Alterna el estado 'enabled' de una tienda específica.
   */
  const handleStoreToggle = (storeId: string) => {
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, enabled: !s.enabled } : s)));
  };

  /**
   * Selecciona o deselecciona todas las tiendas visibles actualmente.
   */
  const handleSelectAllStores = () => {
    const allEnabled = filteredStores.every((s) => s.enabled);
    setStores((prev) =>
      prev.map((s) => {
        // Solo afecta a las tiendas visibles en la vista/pestaña actual
        if (filteredStores.some((fs) => fs.id === s.id)) {
          return { ...s, enabled: !allEnabled };
        }
        return s;
      })
    );
  };

  return {
    stores: visibleStores,
    filteredStores,
    handleStoreToggle,
    handleSelectAllStores,
    enabledStoresCount: filteredStores.filter((s) => s.enabled).length,
  };
};

export type { Store, AdvancedOptions };
