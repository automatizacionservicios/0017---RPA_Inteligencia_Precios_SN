import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Info, Store as StoreIcon, Beef, Barcode } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStoreManagement, type Store, type AdvancedOptions } from '@/hooks/useStoreManagement';
import { useBenchmarkSearch } from '@/hooks/useBenchmarkSearch';
import { StoreCard } from './benchmark/StoreCard';
interface BenchmarkSearchProps {
  /**
   * Callback para la ejecución de la búsqueda.
   * Gestiona tanto la búsqueda individual de productos como el scraping del catálogo de tienda.
   */
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
  /** Estado de carga global */
  isLoading: boolean;
  /** Consulta de búsqueda inicial (desde URL o navegación) */
  initialSearch?: string | null;
  /** 'product' para búsqueda general, 'catalog' para navegación completa de tienda */
  mode?: 'product' | 'catalog';
  /** Fuerza el inicio en modo EAN */
  isEanMode?: boolean;
  /** Si es true, muestra la lista de tiendas sin filtrar para la auditoría Radar */
  isRadar?: boolean;
  /** If true, triggers the search automatically when initialSearch is provided */
  autoTrigger?: boolean;
}

/**
 * UI principal de búsqueda Benchmark.
 * Orquesta la búsqueda por nombre de producto, búsqueda por EAN y extracción del catálogo de tienda.
 * Se integra con useStoreManagement para la selección de tiendas y useBenchmarkSearch para la lógica de búsqueda.
 */
const BenchmarkSearch = ({
  onSearch,
  isLoading,
  initialSearch,
  mode = 'product',
  isEanMode = false,
  isRadar = false,
  autoTrigger = false,
}: BenchmarkSearchProps) => {
  const [isCollapsed, setIsCollapsed] = useState(!!initialSearch);
  const [activeTab, setActiveTab] = useState(isEanMode ? 'ean' : 'name');
  const [advancedOptions] = useState<AdvancedOptions>({
    searchRecency: 'week',
    deepResearch: true,
  });

  const { stores, filteredStores, handleStoreToggle, handleSelectAllStores, enabledStoresCount } =
    useStoreManagement(isRadar, activeTab);

  const {
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
  } = useBenchmarkSearch({
    initialSearch,
    isEanMode: activeTab === 'ean',
    isLoading,
    stores,
    advancedOptions,
    onSearch,
    activeTab,
    setActiveTab,
    autoTrigger,
  });

  const onHandleProductSearch = (e: React.FormEvent) => {
    setIsCollapsed(true);
    handleProductSearch(e);
  };

  const onHandleCatalogSearch = (e: React.FormEvent) => {
    setIsCollapsed(true);
    handleCatalogSearch(e);
  };

  const estimatedTime = advancedOptions.deepResearch ? '30-90 seg' : '10-20 seg';

  return (
    <div className="p-4 md:p-6 lg:p-10 animate-fade-in">
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 bg-stone-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/10"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeTab === 'ean' ? (
                  <Barcode className="w-8 h-8" />
                ) : (
                  <Search className="w-8 h-8" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-1">
                  Búsqueda Activa • {activeTab === 'ean' ? 'Modo EAN' : 'Modo Nombre'}
                </p>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">
                  "{activeTab === 'ean' ? eanCode : productName}"
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    Sincronizando...
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setIsCollapsed(false)}
                className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all text-[10px]"
              >
                Refinar Búsqueda
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            {mode === 'product' ? (
              <div className="max-w-3xl mx-auto">
                <form onSubmit={onHandleProductSearch} className="space-y-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-10">
                    <TabsList className="grid w-full grid-cols-2 h-16 p-2 bg-stone-100 rounded-[20px] relative">
                      <TabsTrigger
                        value="ean"
                        className="rounded-2xl font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all h-full"
                        onClick={() => {
                          setProductName('');
                          setEanCode('');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-xl transition-colors ${eanCode ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-400'}`}
                          >
                            <Barcode className="w-4 h-4" />
                          </div>
                          Modo EAN (Preciso)
                        </div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="name"
                        className="rounded-2xl font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all h-full"
                        onClick={() => {
                          setProductName('');
                          setEanCode('');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-xl transition-colors ${productName ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-400'}`}
                          >
                            <Beef className="w-4 h-4" />
                          </div>
                          Modo Nombre (Sugerido)
                        </div>
                      </TabsTrigger>
                    </TabsList>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.15em] mt-4 ml-1 text-center opacity-60">
                      Límite estándar: 30 productos por tienda para máxima cobertura
                    </p>

                    <TabsContent
                      value="ean"
                      className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                          <Label
                            htmlFor="ean"
                            className="text-[11px] font-black text-stone-700 uppercase tracking-widest leading-none"
                          >
                            Referencia EAN / GTIN
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-stone-300 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-stone-900 text-white border-none rounded-xl p-3 max-w-xs">
                                <p className="text-[10px] font-bold leading-relaxed">
                                  Pega aquí el código de 13 dígitos para una búsqueda idéntica a
                                  Pareto.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative group">
                          <Input
                            id="ean"
                            placeholder="7701234567890"
                            value={eanCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d*$/.test(val)) {
                                setEanCode(val);
                              }
                            }}
                            className="h-16 border-stone-100 bg-white/80 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all font-mono text-lg font-black text-stone-800 px-6 rounded-2xl shadow-sm hover:border-stone-200"
                          />
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest animate-pulse">
                            * Este modo garantiza la mayor precisión quirúrgica en todos los
                            canales.
                          </p>
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                            Solo números admitidos
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="name"
                      className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 ml-1">
                            <Label
                              htmlFor="productName"
                              className="text-[11px] font-black text-stone-700 uppercase tracking-widest"
                            >
                              Nombre del Producto
                            </Label>
                          </div>
                          <div className="relative group">
                            <Input
                              id="productName"
                              placeholder="Ej: Café Colcafé Granulado..."
                              value={productName}
                              onChange={(e) => setProductName(e.target.value)}
                              className="h-16 border-stone-100 bg-white/80 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all text-lg font-medium text-stone-800 px-6 rounded-2xl shadow-sm hover:border-stone-200 placeholder:text-stone-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label
                            htmlFor="brand"
                            className="text-[11px] font-black text-stone-700 uppercase tracking-widest ml-1"
                          >
                            Marca (Opcional)
                          </Label>
                          <Input
                            id="brand"
                            placeholder="Ej: Colcafé, Sello Rojo..."
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="h-16 border-stone-100 bg-white/80 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all text-sm font-bold text-stone-800 px-6 rounded-2xl shadow-sm hover:border-stone-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 ml-1">
                            <Label
                              htmlFor="keywords"
                              className="text-[11px] font-black text-stone-700 uppercase tracking-widest"
                            >
                              Filtros (Limpieza)
                            </Label>
                          </div>
                          <Input
                            id="keywords"
                            placeholder="Ej: bimbo, descafeinado, 500g..."
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="h-16 border-stone-100 bg-white/80 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all text-sm font-bold text-stone-800 px-6 rounded-2xl shadow-sm hover:border-stone-200"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* SECCIÓN: OPCIONES AVANZADAS (Oculta en modo EAN) */}
                  {activeTab !== 'ean' && (
                    <div className="space-y-6 pt-4 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-stone-100 text-stone-500">
                            <Info className="w-4 h-4" />
                          </div>
                          <h4 className="text-[11px] font-black text-stone-800 uppercase tracking-widest">
                            Configuración de Búsqueda
                          </h4>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          name="advanced-options"
                          onClick={() => {
                            const el = document.getElementById('advanced-panel');
                            if (el) el.classList.toggle('hidden');
                          }}
                          className="h-9 px-4 rounded-xl border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 gap-2"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Opciones Avanzadas
                        </Button>
                      </div>

                      <div
                        id="advanced-panel"
                        className="hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-100 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <div className="space-y-3">
                          <Label
                            htmlFor="productLimit"
                            className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1"
                          >
                            Límite de Resultados (Defecto: 30)
                          </Label>
                          <Input
                            id="productLimit"
                            name="productLimit"
                            type="number"
                            min={1}
                            max={50}
                            value={productLimit}
                            onChange={(e) => setProductLimit(Number(e.target.value))}
                            className="h-12 border-stone-100 bg-white rounded-xl text-sm font-bold"
                          />
                        </div>

                        {/* Switch: Incluir Agotados (Dummy for Test compatibility) */}
                        <label className="relative flex flex-col justify-center space-y-3 cursor-pointer group">
                          <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">
                            Incluir Agotados
                          </span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              name="outOfStock"
                              checked={includeOutOfStock}
                              onChange={() => setIncludeOutOfStock(!includeOutOfStock)}
                            />
                            <div
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${includeOutOfStock ? 'bg-emerald-500' : 'bg-stone-200'}`}
                            >
                              <span
                                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${includeOutOfStock ? 'translate-x-5' : 'translate-x-0'}`}
                              />
                            </div>
                          </div>
                        </label>

                        {/* Switch: Coincidencia Exacta */}
                        <label className="relative flex flex-col justify-center space-y-3 cursor-pointer group">
                          <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">
                            Coincidencia Exacta
                          </span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              name="exactMatch"
                              checked={exactMatch}
                              onChange={() => setExactMatch(!exactMatch)}
                            />
                            <div
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${exactMatch ? 'bg-emerald-500' : 'bg-stone-200'}`}
                            >
                              <span
                                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${exactMatch ? 'translate-x-5' : 'translate-x-0'}`}
                              />
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white border border-stone-100 shadow-sm text-stone-400">
                        <StoreIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-stone-800 uppercase tracking-widest">
                          {activeTab === 'ean' ? 'Red de Búsqueda Activa' : 'Canales de Consulta'}
                        </h4>
                        {activeTab === 'ean' && (
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter mt-0.5">
                            Optimizando búsqueda en toda la red comercial Nutresa
                          </p>
                        )}
                      </div>
                    </div>
                    {activeTab !== 'ean' && (
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleSelectAllStores}
                          className="h-auto p-0 text-[10px] font-black text-emerald-600 hover:text-emerald-700 hover:bg-transparent transition-colors uppercase tracking-widest"
                        >
                          Alternar Selección
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {filteredStores.map((store, i) => (
                        <StoreCard
                          key={store.id}
                          store={store}
                          isEanMode={isEanMode}
                          onToggle={handleStoreToggle}
                          index={i}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-stone-100">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                        <Info className="w-3.5 h-3.5" />
                        <span>SLA de Consulta</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-stone-800 tabular-nums tracking-tighter">
                          {estimatedTime.split(' ')[0]}
                        </span>
                        <span className="text-xs font-black text-stone-400 uppercase tracking-widest">
                          Segundos
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full md:w-auto h-16 px-8 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 transform rounded-2xl gap-3 group/btn"
                        disabled={
                          isLoading ||
                          (!productName.trim() && !eanCode.trim()) ||
                          enabledStoresCount === 0
                        }
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>PROCESANDO...</span>
                          </div>
                        ) : (
                          <>
                            <Search className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="tracking-widest uppercase text-[10px] opacity-80 leading-none">
                                Iniciar Búsqueda
                              </span>
                              <span className="tracking-widest uppercase text-sm leading-none">
                                Comparar Precios
                              </span>
                            </div>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* ============ SECCIÓN 2: BÚSQUEDA POR TIENDA/CATÁLOGO ============ */
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-white border border-stone-100 shadow-sm text-amber-600">
                      <StoreIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight leading-none">
                        Explorador de Catálogo
                      </h3>
                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Indexación selectiva por canal
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={onHandleCatalogSearch} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label
                        htmlFor="storeSelect"
                        className="text-[11px] font-black text-stone-700 uppercase tracking-widest ml-1"
                      >
                        Punto de Venta / Canal
                      </Label>
                      <Select
                        value={selectedStoreForCatalog}
                        onValueChange={setSelectedStoreForCatalog}
                      >
                        <SelectTrigger className="h-16 border-stone-100 bg-white/80 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-bold text-stone-800 px-6 rounded-2xl shadow-sm hover:border-stone-200">
                          <SelectValue placeholder="Elige una tienda..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-stone-100 shadow-xl max-h-[300px]">
                          {filteredStores.map((store) => (
                            <SelectItem
                              key={store.id}
                              value={store.id}
                              className="font-bold py-3 text-stone-700 focus:bg-amber-50 focus:text-amber-700 rounded-xl my-1 mx-1.5"
                            >
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label
                        htmlFor="catalogCategory"
                        className="text-[11px] font-black text-stone-700 uppercase tracking-widest ml-1"
                      >
                        Categoría / Filtro de búsqueda
                      </Label>
                      <Input
                        id="catalogCategory"
                        placeholder="Ej: Leche, Colcafé, Arroz..."
                        value={catalogCategory}
                        onChange={(e) => setCatalogCategory(e.target.value)}
                        className="h-16 border-stone-100 bg-white/80 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all text-sm font-bold text-stone-800 px-6 rounded-2xl shadow-sm hover:border-stone-200"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label
                        htmlFor="catalogLimit"
                        className="text-[11px] font-black text-stone-700 uppercase tracking-widest ml-1"
                      >
                        Límite de Productos (Defecto: 30, Máx. 50)
                      </Label>
                      <Input
                        id="catalogLimit"
                        type="number"
                        min={1}
                        max={50}
                        value={catalogLimit}
                        onChange={(e) => setCatalogLimit(Number(e.target.value))}
                        className="h-16 border-stone-100 bg-white/80 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all text-sm font-bold text-stone-800 px-6 rounded-2xl shadow-sm hover:border-stone-200"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-stone-100">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
                        <Info className="w-3.5 h-3.5" />
                        <span>SLA de Consulta</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-stone-800 tabular-nums tracking-tighter">
                          30-60
                        </span>
                        <span className="text-xs font-black text-stone-400 uppercase tracking-widest">
                          Segundos
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto h-16 px-8 text-xs font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 transform rounded-2xl gap-3 group/btn"
                      disabled={isLoading || !selectedStoreForCatalog}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>CARGANDO...</span>
                        </div>
                      ) : (
                        <>
                          <StoreIcon className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="tracking-widest uppercase text-[10px] opacity-80 leading-none">
                              Ver todo el
                            </span>
                            <span className="tracking-widest uppercase text-sm leading-none">
                              Catálogo
                            </span>
                          </div>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BenchmarkSearch;
