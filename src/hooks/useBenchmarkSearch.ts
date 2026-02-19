import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Store, AdvancedOptions } from '@/hooks/useStoreManagement';

interface UseBenchmarkSearchProps {
  /** Consulta de búsqueda inicial (desde URL o navegación) */
  initialSearch?: string | null;
  /** Modo de búsqueda actual (EAN vs Nombre) */
  isEanMode?: boolean;
  /** Estado de carga global */
  isLoading: boolean;
  /** Lista actual de tiendas con su estado de activación */
  stores: Store[];
  /** Configuración de búsqueda (frescura, investigación profunda) */
  advancedOptions: AdvancedOptions;
  /** Callback de búsqueda principal al componente padre */
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
    productLimit?: number,
    exactMatch?: boolean,
    includeOutOfStock?: boolean
  ) => void | Promise<void>;
  /** Pestaña de la interfaz de usuario activa actualmente */
  activeTab: string;
  /** Selector para la pestaña activa de la interfaz de usuario */
  setActiveTab: (tab: string) => void;
  /** Si es true, activa handleProductSearch al montar si existe initialSearch */
  autoTrigger?: boolean;
}

/**
 * Hook para gestionar el estado y la ejecución de la búsqueda para el módulo Benchmark.
 * Estandariza el payload para la edge function.
 */
export const useBenchmarkSearch = ({
  initialSearch,
  isLoading,
  stores,
  advancedOptions,
  onSearch,
  activeTab,
  setActiveTab,
  autoTrigger,
}: UseBenchmarkSearchProps) => {
  // Estado de los criterios de búsqueda
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [eanCode, setEanCode] = useState('');
  const [keywords, setKeywords] = useState('');
  const [productLimit, setProductLimit] = useState<number>(30);
  const [exactMatch, setExactMatch] = useState(false);
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);

  // Estado del modo de catálogo de tienda
  const [selectedStoreForCatalog, setSelectedStoreForCatalog] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [catalogLimit, setCatalogLimit] = useState(30);

  /**
   * Efecto para gestionar la consulta de búsqueda inicial desde la URL o navegación.
   */
  useEffect(() => {
    if (initialSearch) {
      // La búsqueda por EAN suele empezar por 770
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
   * Ejecuta una búsqueda de producto (modo Nombre o EAN).
   */
  const handleProductSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: Se requiere término de búsqueda o EAN
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
      undefined, // storeId
      keywordsList,
      activeTab === 'ean' ? eanCode : undefined, // 9. ean
      brandName || undefined, // 10. brand
      undefined, // 11. category
      productLimit, // 12. productLimit
      exactMatch, // 13. exactMatch
      includeOutOfStock // 14. includeOutOfStock
    );
  };

  /**
   * Ejecuta una extracción del catálogo de la tienda.
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
      '', // productName (no es necesario para catálogo)
      'all',
      'all',
      [store],
      advancedOptions,
      selectedStoreForCatalog,
      [], // palabras clave (no es necesario para catálogo)
      undefined, // ean
      undefined, // brand
      catalogCategory === 'all' ? undefined : catalogCategory,
      catalogLimit
    );
  };

  // Referencia para asegurar que autoTrigger solo se ejecute una vez por montaje de componente
  const hasTriggered = useRef(false);

  /**
   * Efecto para gestionar el activador de búsqueda automática desde navegación externa (ej. Búsqueda desde Inicio)
   */
  useEffect(() => {
    // We only trigger if autoTrigger is true, we have an initial search,
    // we have stores loaded, and WE HAVEN'T TRIGGERED YET
    if (autoTrigger && initialSearch && stores.length > 0 && !isLoading && !hasTriggered.current) {
      const isEan = /^\d{8,14}$/.test(initialSearch);
      const selectedStoresList = stores.filter((s) => s.enabled);

      if (selectedStoresList.length > 0) {
        hasTriggered.current = true; // Marcar solo si realmente vamos a llamar a onSearch
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
          brandName || undefined,
          undefined, // category
          undefined // productLimit
        );
      }
    }
  }, [autoTrigger, initialSearch, stores, isLoading, onSearch, advancedOptions, brandName]);

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
    productLimit,
    setProductLimit,
    exactMatch,
    setExactMatch,
    includeOutOfStock,
    setIncludeOutOfStock,
    handleProductSearch,
    handleCatalogSearch,
  };
};
