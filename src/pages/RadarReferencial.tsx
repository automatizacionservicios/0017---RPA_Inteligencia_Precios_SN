/* eslint-disable */
// Preservando la lógica de negocio heredada para evitar regresiones
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BenchmarkSearch from '@/components/BenchmarkSearch';
import { Store } from '@/hooks/useStoreManagement';
import LoadingProgress from '../components/LoadingProgress';
import { SearchHeader } from '@/components/radar/SearchHeader';
import { SearchResultsModal } from '@/components/radar/SearchResultsModal';
import type { BenchmarkResponse } from '@/types/benchmark';

const RadarReferencial = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BenchmarkResponse | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const [, _setCurrentQuery] = useState('');

  // Manejar la búsqueda inicial desde la navegación
  useEffect(() => {
    const quickSearch = location.state?.quickSearch;

    if (quickSearch) {
      _setCurrentQuery(quickSearch);
    }
  }, [location.state]);

  const handleSearch = useCallback(
    async (
      searchMode: 'product' | 'store-catalog',
      productName: string,
      productType: string,
      presentation: string,
      selectedStores: Store[],
      advancedOptions: any,
      storeId?: string,
      keywords?: string[],
      ean?: string,
      brand?: string,
      category?: string,
      productLimit?: number,
      exactMatch?: boolean
    ) => {
      setIsLoading(true);
      _setCurrentQuery(productName || ean || '');
      setResults(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/price-scraper`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              searchMode,
              productName,
              selectedStores,
              advancedOptions,
              keywords,
              ean,
              brand,
              category,
              productLimit,
              isRadar: true,
              exactMatch,
            }),
          }
        );

        if (!response.ok) throw new Error('Error al realizar la búsqueda');

        const data: BenchmarkResponse = await response.json();

        setResults({
          ...data,
          products: data.products || [],
          searchQuery: productName || ean || data.searchQuery,
          timestamp: new Date().toISOString(),
        });

        setIsResultsModalOpen(true);
        toast.success('Análisis híbrido completado');
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Error al sincronizar datos');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto px-6 xl:px-12 py-12">
        <div className="w-full space-y-12">
          <SearchHeader />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white p-2 rounded-[2.5rem] shadow-xl overflow-hidden">
              <div className="p-1 md:p-2">
                <BenchmarkSearch
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  mode="product"
                  isRadar={true}
                  initialSearch={location.state?.quickSearch}
                  isEanMode={location.state?.isEanMode}
                  autoTrigger={location.state?.autoTrigger}
                />
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <LoadingProgress />
              </motion.div>
            )}
          </AnimatePresence>

          {results && !isLoading && (
            <SearchResultsModal
              results={results}
              isOpen={isResultsModalOpen}
              onOpenChange={setIsResultsModalOpen}
            />
          )}

          {!isLoading && !results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-32 space-y-8 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-stone-200"
            >
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping" />
                <div className="relative w-40 h-40 rounded-full bg-white shadow-2xl border border-stone-50 flex items-center justify-center p-6 transition-transform hover:scale-105 duration-700">
                  <img
                    src="/nutresa-tree.png"
                    alt="Nutresa"
                    className="w-full h-full object-contain filter grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-4 max-w-lg mx-auto">
                <h4 className="text-3xl font-black text-stone-900 uppercase tracking-tighter leading-none">
                  Motor Radar <span className="text-emerald-600 italic">Activo</span>
                </h4>
                <p className="text-stone-400 text-sm font-bold uppercase tracking-widest leading-loose">
                  Sincroniza precios competitivos, detecta brechas de mercado y optimiza el
                  posicionamiento de Nutresa en segundos.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RadarReferencial;
