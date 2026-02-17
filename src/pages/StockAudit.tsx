/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageCheck,
  ShoppingCart,
  Store,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingProgress from '@/components/LoadingProgress';
import BenchmarkSearch from '@/components/BenchmarkSearch';
import { Store as StoreType } from '@/hooks/useStoreManagement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getStoreBrand } from '@/lib/store-branding';

const StockAudit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationId, setLocationId] = useState(
    () => localStorage.getItem('selectedLocationId') || 'bogota'
  );

  const handleLocationChange = (newId: string) => {
    setLocationId(newId);
    localStorage.setItem('selectedLocationId', newId);
  };

  const handleSearch = async (
    searchMode: 'product' | 'store-catalog',
    productName: string,
    productType: string,
    presentation: string,
    selectedStores: StoreType[],
    advancedOptions: any,
    storeId?: string,
    keywords?: string[],
    ean?: string,
    brand?: string,
    category?: string,
    productLimit?: number,
    selectedLocationId?: string,
    exactMatch?: boolean
  ) => {
    const locId = selectedLocationId || locationId;
    setIsLoading(true);
    setSearchTerm(productName || ean || '');
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
            locationId: locId,
            exactMatch,
          }),
        }
      );

      if (!response.ok) throw new Error('Error al realizar la auditoría');

      const data = await response.json();
      setResults(data);
      toast.success('Auditoría de existencias completada');
    } catch (error) {
      console.error('Audit error:', error);
      toast.error('Error al sincronizar existencias');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto px-6 xl:px-12 py-12 w-full">
        <div className="space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20"
            >
              <PackageCheck className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">
                Módulo de Disponibilidad v1.0
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter leading-none">
              Auditoría de <span className="text-amber-500 italic">Existencias</span>
            </h1>
            <p className="text-stone-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
              Verifica el stock real en toda la red retail. Evita agotamientos y optimiza el
              despacho.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/80 backdrop-blur-xl border border-white p-2 rounded-[2.5rem] shadow-xl overflow-hidden"
          >
            <BenchmarkSearch
              onSearch={handleSearch}
              isLoading={isLoading}
              mode="product"
              isRadar={true}
              locationId={locationId}
              setLocationId={handleLocationChange}
            />
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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-stone-900 text-white shadow-lg">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                      Estado de Inventario
                    </h3>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                      Resultados para: {searchTerm}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.products?.map((product: any, idx: number) => {
                  const brand = getStoreBrand(product.store);
                  const isAvailable =
                    product.price > 0 && !product.productName.toLowerCase().includes('agotado');

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="rounded-[32px] overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-500 group">
                        <CardContent className="p-6 space-y-6">
                          {/* Product Image Section */}
                          <div className="relative aspect-square w-full rounded-2xl bg-stone-50 border border-stone-100/50 overflow-hidden group-hover:shadow-inner transition-all duration-700">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.productName}
                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-20 group-hover:opacity-30 transition-opacity">
                                <PackageCheck className="w-12 h-12 text-stone-900" />
                                <span className="text-[8px] font-black uppercase tracking-widest">
                                  Sin Imagen
                                </span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center p-2 bg-white">
                                <img
                                  src={brand.icon || ''}
                                  alt={product.store}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-[10px] font-black text-stone-800 uppercase tracking-widest">
                                {product.store}
                              </span>
                            </div>
                            <Badge
                              className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}
                            >
                              {isAvailable ? (
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3" /> En Stock
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <XCircle className="w-3 h-3" /> Agotado
                                </span>
                              )}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-black text-stone-900 uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
                              {product.productName}
                            </h4>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                              {product.brand || 'Marca no detectada'}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                                Último Precio
                              </span>
                              <span className="text-lg font-black text-stone-900 tracking-tighter">
                                ${product.price?.toLocaleString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              className="h-10 w-10 rounded-xl bg-stone-50 hover:bg-amber-50 hover:text-amber-600 transition-all"
                              onClick={() => window.open(product.url, '_blank')}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {!isLoading && !results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-24 space-y-8 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-stone-200"
            >
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-amber-500/5 rounded-full animate-ping" />
                <div className="relative w-32 h-32 rounded-full bg-white shadow-2xl border border-stone-50 flex items-center justify-center p-6">
                  <PackageCheck className="w-12 h-12 text-amber-500 opacity-40" />
                </div>
              </div>
              <div className="space-y-4 max-w-lg mx-auto px-6">
                <h4 className="text-2xl font-black text-stone-900 uppercase tracking-tighter leading-none">
                  Inicia una <span className="text-amber-600 italic">Auditoría Global</span>
                </h4>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest leading-loose">
                  Ingresa un producto para verificar su disponibilidad inmediata en la red de
                  aliados y tiendas propias Nutresa.
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

export default StockAudit;
