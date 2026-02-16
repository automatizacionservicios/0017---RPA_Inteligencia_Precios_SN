export type StoreStatus = 'online' | 'manual' | 'maintenance' | 'coming_soon';

interface HealthRegistry {
  [storeId: string]: {
    status: StoreStatus;
    lastSuccess?: string;
    lastError?: string;
    consecutiveErrors: number;
  };
}

const STORAGE_KEY = 'centinela_store_health';

export const storeHealth = {
  getRegistry(): HealthRegistry {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch (e) {
      return {};
    }
  },

  saveRegistry(registry: HealthRegistry) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  },

  reportSuccess(storeId: string) {
    const registry = this.getRegistry();
    registry[storeId] = {
      ...registry[storeId],
      status: 'online',
      lastSuccess: new Date().toISOString(),
      consecutiveErrors: 0,
    };
    this.saveRegistry(registry);
    console.log(`[CENTINELA] ${storeId} is ONLINE`);
  },

  reportError(storeId: string) {
    const registry = this.getRegistry();
    const current = registry[storeId] || { status: 'online', consecutiveErrors: 0 };

    const newConsecutiveErrors = current.consecutiveErrors + 1;

    // If it fails 3 times in a row, marked as maintenance automatically
    // Unless it's a manual or coming_soon store
    let newStatus: StoreStatus = current.status;
    if (
      newConsecutiveErrors >= 3 &&
      current.status !== 'manual' &&
      current.status !== 'coming_soon'
    ) {
      newStatus = 'maintenance';
    }

    registry[storeId] = {
      ...current,
      status: newStatus,
      lastError: new Date().toISOString(),
      consecutiveErrors: newConsecutiveErrors,
    };
    this.saveRegistry(registry);
    console.warn(`[CENTINELA] ${storeId} reported error (#${newConsecutiveErrors})`);
  },

  getEffectiveStatus(storeId: string, defaultStatus: StoreStatus): StoreStatus {
    const registry = this.getRegistry();
    const stored = registry[storeId.toLowerCase()];

    if (!stored) return defaultStatus;

    // If hardcoded is 'manual' or 'coming_soon', we respect that always
    if (defaultStatus === 'manual' || defaultStatus === 'coming_soon') return defaultStatus;

    return stored.status;
  },
};
