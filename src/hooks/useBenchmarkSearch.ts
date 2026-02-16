import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Store, AdvancedOptions } from '@/hooks/useStoreManagement';

interface UseBenchmarkSearchProps {
  /** Initial search query (from URL or navigation) */
  initialSearch?: string | null;
  /** Current search mode (EAN vs Name) */
  isEanMode?: boolean;
  /** Global loading state */
  isLoading: boolean;
  /** Current list of stores with their enabled state */
  stores: Store[];
  /** Search configuration (freshness, deep research) */
  advancedOptions: AdvancedOptions;
  /** Main search callback to the parent component */
  onSearch: (
    searchMode: 'product' | 'store-catalog',
    productName: string,
    productType: string,
    presentation: string,
    selectedStores: Store[],
    advancedOptions: AdvancedOptions,
    storeId?: string,
    keywords?: string[],
    ean?: string,
    brand?: string,
    category?: string,
    productLimit?: number
  ) => void | Promise<void>;
  /** Current active UI tab */
  activeTab: string;
  /** Setter for the active UI tab */
  setActiveTab: (tab: string) => void;
  /** If true, triggers handleProductSearch on mount if initialSearch exists */
  autoTrigger?: boolean;
}

/**
 * Hook to manage state and search execution for the Benchmark module.
 * Standardizes the payload for the edge function.
 */
export const useBenchmarkSearch = ({
  initialSearch,
  isEanMode,
  isLoading,
  stores,
  advancedOptions,
  onSearch,
  activeTab,
  setActiveTab,
  autoTrigger,
}: UseBenchmarkSearchProps) => {
  // Search Criteria State
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [eanCode, setEanCode] = useState('');
  const [keywords, setKeywords] = useState('');

  // Store Catalog Mode State
  const [selectedStoreForCatalog, setSelectedStoreForCatalog] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [catalogLimit, setCatalogLimit] = useState(50);

  /**
   * Effect to handle initial search query from URL or navigation.
   */
  useEffect(() => {
    if (initialSearch) {
      // EAN search usually starts with 770
      if (initialSearch.match(/^\d{8,14}$/)) {
        setEanCode(initialSearch);
        setActiveTab('ean');
      } else {
        setProductName(initialSearch);
        setActiveTab('name');
      }
    }
  }, [initialSearch, setActiveTab]);

  /**
   * Executes a Product Search (Name or EAN mode).
   */
  const handleProductSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Search term or EAN required
    if (activeTab === 'name' && !productName.trim()) {
      toast.error('Por favor ingresa un nombre de producto');
      return;
    }
    if (activeTab === 'ean' && !eanCode.trim()) {
      toast.error('Por favor ingresa un código EAN');
      return;
    }

    const selectedStoresList = stores.filter((s) => s.enabled);
    if (selectedStoresList.length === 0) {
      toast.error('Selecciona al menos una tienda');
      return;
    }

    const keywordsList = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    onSearch(
      'product',
      productName,
      'all', // productType (legacy)
      'all', // presentation (legacy)
      selectedStoresList,
      advancedOptions,
      undefined, // storeId (not needed for general search)
      keywordsList,
      activeTab === 'ean' ? eanCode : undefined,
      eanCode || undefined,
      brandName || undefined
    );
  };

  /**
   * Executes a Store Catalog extraction.
   */
  const handleCatalogSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreForCatalog) {
      toast.error('Selecciona una tienda');
      return;
    }

    const store = stores.find((s) => s.id === selectedStoreForCatalog);
    if (!store) return;

    onSearch(
      'store-catalog',
      '', // productName (not needed for catalog)
      'all',
      'all',
      [store],
      advancedOptions,
      selectedStoreForCatalog,
      [], // keywords (not needed for catalog)
      undefined, // ean
      undefined, // brand
      catalogCategory === 'all' ? undefined : catalogCategory,
      catalogLimit
    );
  };

  // Ref to ensure autoTrigger only runs once per component mount
  const hasTriggered = useRef(false);

  /**
   * Effect to handle automatic search trigger from external navigation (e.g. Home Search)
   */
  useEffect(() => {
    // We only trigger if autoTrigger is true, we have an initial search, 
    // we have stores loaded, and WE HAVEN'T TRIGGERED YET
    if (autoTrigger && initialSearch && stores.length > 0 && !isLoading && !hasTriggered.current) {
      hasTriggered.current = true; // Mark as triggered immediately

      const timer = setTimeout(() => {
        const isEan = /^\d{8,14}$/.test(initialSearch);
        const selectedStoresList = stores.filter((s) => s.enabled);

        if (selectedStoresList.length > 0) {
          onSearch(
            'product',
            !isEan ? initialSearch : '',
            'all',
            'all',
            selectedStoresList,
            advancedOptions,
            undefined,
            [],
            isEan ? initialSearch : undefined,
            brandName || undefined
          );
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoTrigger, initialSearch, stores.length, isLoading]); // Minimal dependencies

  return {
    productName,
    setProductName,
    brandName,
    setBrandName,
    eanCode,
    setEanCode,
    keywords,
    setKeywords,
    selectedStoreForCatalog,
    setSelectedStoreForCatalog,
    catalogCategory,
    setCatalogCategory,
    catalogLimit,
    setCatalogLimit,
    handleProductSearch,
    handleCatalogSearch,
  };
};
