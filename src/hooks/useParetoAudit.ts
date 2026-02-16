import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ParetoItem } from './useParetoData';
import { MarketProduct } from '@/types/benchmark';

interface UseParetoAuditProps {
  /** List of products to be audited */
  items: ParetoItem[];
  /** Setter for the products list (to update status/results) */
  setItems: (items: ParetoItem[]) => void;
  /** List of stores to perform the audit against */
  stores: { id: string; name: string; enabled: boolean }[];
  /** Callback executed when audit results are collected */
  onResultsFound: (results: MarketProduct[]) => void;
  /** 'best-price' to take only the first result, 'full-list' for all */
  searchMode: 'best-price' | 'full-list';
  /** Location context (Legacy, usually 'national') */
  locationId: string;
}

/**
 * Hook to manage the bulk audit process for the Pareto module.
 * Orchestrates sequential API calls for each selected product across enabled stores.
 */
export const useParetoAudit = ({
  items,
  setItems,
  stores,
  onResultsFound,
  searchMode,
  locationId,
}: UseParetoAuditProps) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const pauseRef = useRef(false);
  const stopRef = useRef(false);
  const searchModeRef = useRef(searchMode);

  // Keep searchMode ref in sync for the async loop
  useEffect(() => {
    searchModeRef.current = searchMode;
  }, [searchMode]);

  /**
   * Main execution loop for the audit.
   * Processes selected items in parallel batches (concurrency: 3-5) to optimize speed.
   */
  const runAudit = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      toast.error('Por favor selecciona al menos un producto');
      return;
    }

    const selectedStores = stores.filter((s) => s.enabled).map((s) => ({ id: s.id, name: s.name }));
    if (selectedStores.length === 0) {
      toast.error('Por favor selecciona al menos una tienda');
      return;
    }

    // Initialize audit state
    setIsAuditing(true);
    setIsPaused(false);
    setIsFinished(false);
    pauseRef.current = false;
    stopRef.current = false;
    setProgress(0);

    const total = selectedItems.length;
    let completed = 0;
    const updatedItems = [...items];

    /**
     * Individual worker to process a single item
     */
    const processItem = async (itemIndex: number) => {
      if (stopRef.current) return;

      // Pause/Resume handling
      while (pauseRef.current && !stopRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (stopRef.current) return;

      updatedItems[itemIndex].status = 'searching';
      setItems([...updatedItems]);

      try {
        const payload = {
          searchMode: 'product',
          productName: updatedItems[itemIndex].productName.startsWith('Producto ')
            ? ''
            : updatedItems[itemIndex].productName,
          keywords: updatedItems[itemIndex].keywords,
          ean: updatedItems[itemIndex].ean,
          selectedStores: selectedStores,
          categoryFilter: 'all',
          advancedOptions: {
            searchRecency: 'month',
            deepResearch: false,
          },
          locationId: locationId,
        };

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/price-scraper`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        updatedItems[itemIndex].foundProducts = data.products || [];
        updatedItems[itemIndex].status = 'completed';
      } catch (error) {
        console.error(`Error auditing ${updatedItems[itemIndex].productName}:`, error);
        updatedItems[itemIndex].status = 'error';
      }

      completed++;
      setProgress((completed / total) * 100);
      setItems([...updatedItems]);
    };

    // Execution pool (Concurrency: 3)
    const CONCURRENCY = 3;
    const queue = updatedItems
      .map((item, index) => ({ item, index }))
      .filter((obj) => obj.item.selected);

    const workers: Promise<void>[] = [];

    // Distribute items across workers
    for (let i = 0; i < CONCURRENCY; i++) {
      workers.push(
        (async () => {
          while (queue.length > 0 && !stopRef.current) {
            const task = queue.shift();
            if (task) {
              await processItem(task.index);
            }
          }
        })()
      );
    }

    await Promise.all(workers);

    // Cleanup finalize
    setIsAuditing(false);
    setIsPaused(false);
    setIsFinished(true);
    pauseRef.current = false;

    if (stopRef.current) {
      toast.info('Proceso detenido');
      stopRef.current = false;
      return;
    }

    toast.success('Carga masiva completada');

    // Collect and bubble up results based on searchMode
    const finalRequiredResults: MarketProduct[] = [];
    updatedItems.forEach((item) => {
      if (item.selected && item.foundProducts && item.foundProducts.length > 0) {
        if (searchModeRef.current === 'best-price') {
          finalRequiredResults.push(item.foundProducts[0]);
        } else {
          finalRequiredResults.push(...item.foundProducts);
        }
      }
    });

    if (finalRequiredResults.length > 0) {
      onResultsFound(finalRequiredResults);
    }
  };

  /**
   * Resets the entire audit process and clears results.
   */
  const resetAudit = () => {
    if (isAuditing) {
      stopRef.current = true;
      pauseRef.current = false;
      setIsPaused(false);
    }
    setItems(
      items.map((item) => ({
        ...item,
        status: 'pending',
        foundProducts: undefined,
      }))
    );
    setProgress(0);
    setIsAuditing(false);
  };

  /**
   * Toggles between paused and running states.
   */
  const togglePause = () => {
    const nextPause = !isPaused;
    setIsPaused(nextPause);
    pauseRef.current = nextPause;
  };

  return {
    isAuditing,
    isPaused,
    progress,
    isFinished,
    setIsFinished,
    runAudit,
    resetAudit,
    togglePause,
  };
};
