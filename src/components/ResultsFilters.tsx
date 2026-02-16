import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Filter, RotateCcw, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketProduct } from '@/types/benchmark';
import { GrammageFilter } from './filters/GrammageFilter';
import { StoreFilter } from './filters/StoreFilter';
import { BrandFilter } from './filters/BrandFilter';
import { PriceFilter } from './filters/PriceFilter';
import { parseGramsFromPresentation } from './filters/utils';

interface ResultsFiltersProps {
  products: MarketProduct[];
  onFilterChange: (filteredProducts: MarketProduct[]) => void;
}

const ResultsFilters = ({ products, onFilterChange }: ResultsFiltersProps) => {
  // Memoize calculations
  const { minGrams, maxGrams, minPrice, maxPrice, stores, brands } = useMemo(() => {
    const grammages = products
      .map((p) => p.gramsAmount || parseGramsFromPresentation(p.presentation))
      .filter((g): g is number => g !== null && g > 0);

    const uniqueBrands = Array.from(
      new Set(
        products
          .map((p) => p.brand)
          .filter((b): b is string => b !== undefined && b !== null && b.trim() !== '')
      )
    ).sort();

    const prices = products.map((p) => p.price).filter((p) => p > 0);

    return {
      minGrams: grammages.length > 0 ? Math.floor(Math.min(...grammages)) : 0,
      maxGrams: grammages.length > 0 ? Math.ceil(Math.max(...grammages)) : 1000,
      minPrice: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      maxPrice: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 100000,
      stores: Array.from(new Set(products.map((p) => p.store))).sort(),
      brands: uniqueBrands,
    };
  }, [products]);

  const [gramRange, setGramRange] = useState<[number | null, number | null]>([null, null]);
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [selectedStores, setSelectedStores] = useState<string[]>(stores);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brands);
  const [onlyDeals, setOnlyDeals] = useState(false);

  useEffect(() => {
    setSelectedStores(stores);
  }, [stores]);

  useEffect(() => {
    setSelectedBrands(brands);
  }, [brands]);

  // Apply filters with useCallback
  const applyFilters = useCallback(() => {
    const filtered = products.filter((product) => {
      const grams = product.gramsAmount || parseGramsFromPresentation(product.presentation);

      const gramMatch =
        !grams ||
        ((gramRange[0] === null || grams >= gramRange[0]) &&
          (gramRange[1] === null || grams <= gramRange[1]));

      const priceMatch =
        (priceRange[0] === null || product.price >= priceRange[0]) &&
        (priceRange[1] === null || product.price <= priceRange[1]);

      const storeMatch = selectedStores.includes(product.store);

      const brandMatch = !product.brand || selectedBrands.includes(product.brand);

      const dealMatch =
        !onlyDeals || (product.regularPrice && product.regularPrice > product.price);

      return gramMatch && priceMatch && storeMatch && brandMatch && dealMatch;
    });

    onFilterChange(filtered);
  }, [gramRange, priceRange, selectedStores, selectedBrands, products, onFilterChange, onlyDeals]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleClearFilters = useCallback(() => {
    setGramRange([null, null]);
    setPriceRange([null, null]);
    setSelectedStores(stores);
    setSelectedBrands(brands);
    setOnlyDeals(false);
  }, [stores, brands]);

  const handleStoreToggle = useCallback((store: string) => {
    setSelectedStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    );
  }, []);

  const handleToggleAllStores = useCallback(() => {
    setSelectedStores((prev) => (prev.length === stores.length ? [] : stores));
  }, [stores]);

  const handleBrandToggle = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  const handleToggleAllBrands = useCallback(() => {
    setSelectedBrands((prev) => (prev.length === brands.length ? [] : brands));
  }, [brands]);

  const hasActiveFilters = useMemo(
    () =>
      gramRange[0] !== null ||
      gramRange[1] !== null ||
      priceRange[0] !== null ||
      priceRange[1] !== null ||
      selectedStores.length !== stores.length ||
      selectedBrands.length !== brands.length ||
      onlyDeals,
    [
      gramRange,
      priceRange,
      selectedStores.length,
      stores.length,
      selectedBrands.length,
      brands.length,
      onlyDeals,
    ]
  );

  return (
    <Card className="border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 overflow-hidden rounded-3xl group/filters">
      <div className="bg-stone-50/50 px-8 py-6 border-b border-stone-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white border border-stone-100 shadow-sm text-emerald-600 group-hover/filters:rotate-12 transition-transform duration-500">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">
                Herramientas de Filtrado
              </h3>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                Refinación avanzada de {products.length} productos
              </p>
            </div>
          </div>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-10 px-5 rounded-xl border-stone-100 text-[11px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-all duration-300 gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESETEAR FILTROS
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CardContent className="p-8">
        {/* Market Opportunities Toggle - NEW */}
        <div className="flex items-center justify-between p-4 mb-8 rounded-2xl bg-emerald-50/50 border border-emerald-100 shadow-inner group/promo transition-all hover:bg-emerald-50">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl transition-all duration-500 ${onlyDeals ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-emerald-600 border border-emerald-100'}`}
            >
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight leading-none">
                Inteligencia de Ofertas
              </h4>
              <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest mt-1">
                Ocultar productos sin descuento activo
              </p>
            </div>
          </div>
          <Button
            variant={onlyDeals ? 'default' : 'outline'}
            onClick={() => setOnlyDeals(!onlyDeals)}
            className={`h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-500 gap-2 ${
              onlyDeals
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20'
                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            {onlyDeals ? 'Detección Activa' : 'Filtrar por Ofertas'}
            <div
              className={`w-2 h-2 rounded-full ${onlyDeals ? 'bg-white animate-pulse' : 'bg-emerald-200'}`}
            />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Column 1: Stacking Range Filters */}
          <div className="space-y-12 lg:pr-10 lg:border-r lg:border-stone-50">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GrammageFilter
                minGrams={minGrams}
                maxGrams={maxGrams}
                gramRange={gramRange}
                onGramRangeChange={setGramRange}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PriceFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </motion.div>
          </div>

          {/* Column 2: Selection Filters (Stores) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:px-6 lg:border-r lg:border-stone-50"
          >
            <StoreFilter
              stores={stores}
              selectedStores={selectedStores}
              onStoreToggle={handleStoreToggle}
              onToggleAll={handleToggleAllStores}
            />
          </motion.div>

          {/* Column 3: Selection Filters (Brands) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:pl-6"
          >
            <BrandFilter
              brands={brands}
              selectedBrands={selectedBrands}
              onBrandToggle={handleBrandToggle}
              onToggleAll={handleToggleAllBrands}
            />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsFilters;
