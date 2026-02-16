/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingDown,
  LayoutGrid,
  List,
  Search,
  ArrowRight,
  Zap,
  Loader2,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BenchmarkResults from '@/components/BenchmarkResults';
import LoadingProgress from '@/components/LoadingProgress';
import { toast } from 'sonner';
import { storeHealth } from '@/lib/store-health';
import type { MarketProduct, BenchmarkResponse } from '@/types/benchmark';

const PromoRadar = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<MarketProduct[]>([]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      // Strategic categories for Nutresa - Now searching multiple clusters to ensure high yield
      const clusters = [
        ['café colcafé', 'café sello rojo'],
        ['galletas noel', 'galletas festival', 'saltin noel'],
        ['chocolate corona', 'chocolisto'],
        ['pastas doria'],
        ['zenú', 'ranchera'],
      ];

      // Pick 2 random clusters to broaden search
      const selectedClusters = [...clusters]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .flat();

      const allDeals: MarketProduct[] = [];

      for (const category of selectedClusters) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/price-scraper`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              searchMode: 'product',
              productName: category,
              productLimit: 40,
              isRadar: true,
            }),
          }
        );

        if (response.ok) {
          const data: BenchmarkResponse = await response.json();
          const products = data.products || [];
          const storeErrors = (data as any).storeErrors || [];

          // --- CENTINELA: Report Health ---
          const successfulStores = new Set(products.map((p: any) => p.store.toLowerCase()));
          successfulStores.forEach((s) => {
            // For PromoRadar, store names might be strings, need careful matching
            // But usually reportSuccess handles normalized IDs
            storeHealth.reportSuccess(s);
          });
          storeErrors.forEach((s: string) => storeHealth.reportError(s));

          allDeals.push(...products);
        }
      }

      // Filter only products with active discounts and sort by intensity
      const validDeals = allDeals
        .filter((p) => (p.discountPercentage || 0) > 0)
        .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));

      // Remove duplicates by name and store
      const seen = new Set();
      const uniqueDealsMap = validDeals.filter((el) => {
        const duplicate = seen.has(`${el.productName}-${el.store}`);
        seen.add(`${el.productName}-${el.store}`);
        return !duplicate;
      });

      // --- DIVERSITY FILTER: Prevent one store from dominating ---
      const storeCount: Record<string, number> = {};
      const diverseDeals = uniqueDealsMap.filter((p) => {
        const s = p.store.toLowerCase();
        storeCount[s] = (storeCount[s] || 0) + 1;
        return storeCount[s] <= 6; // Max 6 items per store to ensure variety
      });

      // Sort finally by discount but we've already ensured no store has more than 6 slots
      const finalDeals = diverseDeals.sort(
        (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0)
      );

      setResults(finalDeals.length > 0 ? finalDeals : allDeals.slice(0, 12));

      if (finalDeals.length > 0) {
        toast.success(`Se detectaron ${finalDeals.length} oportunidades críticas en el mercado.`);
      } else {
        toast.info('Radar activo: Monitoreando estabilidad de precios.');
      }
    } catch (error) {
      console.error('PromoRadar Error:', error);
      toast.error('No se pudo establecer conexión con el Radar de Oportunidades');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <main className="max-w-[1440px] mx-auto px-6 xl:px-12 py-12">
        {/* Hero Section - Opportunities */}
        <div className="relative mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-end justify-between gap-6"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  Inteligencia de Descuentos
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter leading-[0.9]">
                Oportunidades de <span className="text-emerald-600 italic">Mercado</span>
              </h1>
              <p className="text-stone-500 font-medium text-lg mt-4 max-w-xl">
                Monitoreo en tiempo real de caídas de precio, ofertas relámpago y diferenciales
                competitivos en el sector.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={fetchOpportunities}
                disabled={isLoading}
                variant="outline"
                className="h-12 px-6 rounded-2xl border-stone-200 text-stone-600 font-extrabold uppercase tracking-widest hover:bg-stone-50 transition-all gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-500" />
                )}
                Actualizar Radar
              </Button>
              <div className="flex items-center bg-white border border-stone-200 p-1 rounded-2xl shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Vista de cuadrícula"
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  aria-label="Vista de tabla"
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12">
            <LoadingProgress />
          </div>
        )}

        {/* Opportunities Grid/Results */}
        {!isLoading && (
          <div className="space-y-12">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {results.length > 0 ? (
                    results.map((item, idx) => (
                      <motion.div
                        key={`${item.productName}-${idx}`}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      >
                        <Card className="h-full overflow-hidden border-none shadow-soft group hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white relative">
                          {/* Discount Badge Floating - High Impact Animation */}
                          {item.discountPercentage && item.discountPercentage > 0 && (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute top-4 right-4 z-10"
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.1, 1],
                                  boxShadow: [
                                    '0 0 0px rgba(244, 63, 94, 0)',
                                    '0 0 20px rgba(244, 63, 94, 0.4)',
                                    '0 0 0px rgba(244, 63, 94, 0)',
                                  ],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                                className="bg-rose-500 text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-rose-500/30 flex items-center gap-2 border-2 border-white/20"
                              >
                                <TrendingDown className="w-4 h-4" />-{item.discountPercentage}%
                              </motion.div>
                            </motion.div>
                          )}

                          <CardHeader className="p-8">
                            <div className="flex items-center gap-2 mb-4">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-black uppercase tracking-widest border-stone-200"
                              >
                                {item.store}
                              </Badge>
                              {item.brand && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] font-black uppercase tracking-widest bg-stone-100 text-stone-600"
                                >
                                  {item.brand}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl font-black text-stone-900 leading-tight group-hover:text-emerald-600 transition-colors uppercase italic truncate">
                              {item.productName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-8 pt-0">
                            <div className="flex items-baseline gap-3 mb-6">
                              <span className="text-3xl font-black text-stone-900 tracking-tighter">
                                ${item.price.toLocaleString('es-CO')}
                              </span>
                              {item.regularPrice && item.regularPrice > item.price && (
                                <span className="text-lg font-bold text-stone-300 line-through">
                                  ${item.regularPrice.toLocaleString('es-CO')}
                                </span>
                              )}
                            </div>

                            <div className="space-y-3 p-5 rounded-2xl bg-stone-50 border border-stone-100">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-stone-400">
                                <span>Eficiencia</span>
                                <span className="text-emerald-600">
                                  ${item.pricePerGram.toFixed(2)}/u
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min((item.discountPercentage || 0) + 40, 100)}%`,
                                  }}
                                  className="h-full bg-emerald-500"
                                />
                              </div>
                            </div>

                            <Button
                              variant="default"
                              asChild
                              className="w-full mt-8 h-12 rounded-xl bg-stone-900 hover:bg-emerald-600 text-white font-black uppercase tracking-widest transition-all gap-2 group/btn"
                            >
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                Ver en Tienda
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full py-32 text-center bg-white/50 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-stone-200"
                    >
                      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-stone-300" />
                      </div>
                      <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter mb-2">
                        Sin Ofertas Críticas
                      </h3>
                      <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto">
                        El radar está patrullando el mercado pero no detectó caídas de precio
                        significativas en este momento.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <BenchmarkResults
                products={results}
                searchQuery="Radar de Oportunidades Nutresa"
                timestamp={new Date().toISOString()}
              />
            )}

            {/* Alert Config - Surprise Feature */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="p-12 rounded-[2.5rem] bg-stone-900 text-white relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-emerald-500/30" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl text-center md:text-left">
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-4 leading-none">
                    ¿Quieres recibir <span className="text-emerald-400">Alertas Relámpago</span>?
                  </h3>
                  <p className="text-stone-400 font-medium">
                    Configura el motor para que te notifique vía Teams o Correo cuando un competidor
                    clave baje sus precios más de un 15%.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <input
                    type="email"
                    placeholder="Tu correo corporativo"
                    className="h-14 px-6 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full md:w-64 transition-all"
                  />
                  <Button className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex-shrink-0">
                    Activar Alerta
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PromoRadar;
