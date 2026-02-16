import { useState, useEffect, useMemo } from 'react';
import { canSearchByEan } from '@/lib/store-capabilities';
import { getStoresByLocation } from '@/lib/store-coverage';
import { Store, AdvancedOptions } from '@/types/store';
import { getDefaultStoreList } from '@/lib/store-registry';

/**
 * Hook to manage the list of stores for Benchmark and Radar search.
 * Handles store selection, EAN/Name capability filtering, and national coverage.
 *
 * @param isRadar - If true, ignores certain hardcoded store exclusions (if any).
 * @param activeTab - Current search mode ('name' or 'ean') used to filter store capabilities.
 * @returns Object with available stores, handlers for toggling, and selection counts.
 */
export const useStoreManagement = (isRadar: boolean, activeTab: string) => {
  useEffect(() => {
    // Security cleanup of legacy storage keys
    localStorage.removeItem('customBenchmarkStores');
  }, []);

  // Load initial store list from the centralized registry
  const [stores, setStores] = useState<Store[]>(getDefaultStoreList());

  /**
   * Stores visible in the current UI tab.
   * Filters stores by their capability (e.g., if Name mode, all are visible; if EAN, only EAN-capable ones).
   */
  const visibleStores = useMemo(() => {
    // Centralized national coverage logic
    const allStores = getStoresByLocation(stores, 'national');

    // Mode-based capability filtering
    if (activeTab === 'name') return allStores;

    // Filters out stores that don't support direct EAN search (e.g., D1, Makro)
    return allStores.filter((s) => canSearchByEan(s.id));
  }, [stores, activeTab]);

  /**
   * Stores available for interaction (after applying specific exclusions).
   */
  const filteredStores = visibleStores; // Simplified as manualStoreIds is currently empty

  /**
   * Toggles the 'enabled' state of a specific store.
   */
  const handleStoreToggle = (storeId: string) => {
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, enabled: !s.enabled } : s)));
  };

  /**
   * Selects or deselects all currently visible stores.
   */
  const handleSelectAllStores = () => {
    const allEnabled = filteredStores.every((s) => s.enabled);
    setStores((prev) =>
      prev.map((s) => {
        // Only affect stores visible in the current view/tab
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
