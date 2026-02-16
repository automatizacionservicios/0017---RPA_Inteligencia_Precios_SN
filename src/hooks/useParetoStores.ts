import { useState, useMemo } from 'react';
import { getStoresByLocation } from '@/lib/store-coverage';
import { Store } from '@/types/store';
import { getDefaultStoreList } from '@/lib/store-registry';

/**
 * Hook to manage stores specifically for the Pareto/Audit module.
 * Standardizes coverage to 'national' for consistent data fetching.
 *
 * @param locationId - Legacy param, currently defaults to 'national' for unified search.
 */
export const useParetoStores = (locationId: string = 'national') => {
  // Single source of truth for stores
  const [stores, setStores] = useState<Store[]>(getDefaultStoreList());

  const filteredStores = useMemo(() => {
    // Exclude stores requested by the user for Pareto (Massive Load)
    const restrictedIds = ['rappi', 'carulla', 'd1', 'makro'];
    const list = stores.filter((s) => !restrictedIds.includes(s.id));

    // All stores are considered national under the current architecture
    return getStoresByLocation(list, locationId);
  }, [stores, locationId]);

  const handleStoreToggle = (storeId: string) => {
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, enabled: !s.enabled } : s)));
  };

  return {
    stores: filteredStores,
    setStores,
    handleStoreToggle,
    enabledStoresCount: filteredStores.filter((s) => s.enabled).length,
  };
};
