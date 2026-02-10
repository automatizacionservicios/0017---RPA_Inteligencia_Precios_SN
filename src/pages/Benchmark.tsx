import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, TreeDeciduous, Search, Zap, Trash2, Store as StoreIcon, CheckCircle2, ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BenchmarkSearch from "@/components/BenchmarkSearch";
import BenchmarkResults from "@/components/BenchmarkResults";
import BenchmarkChart from "@/components/BenchmarkChart";
import LoadingProgress from "@/components/LoadingProgress";
import { ParetoInput } from "@/components/ParetoInput";
import EanSearch from "@/components/EanSearch";
import { Store, AdvancedOptions } from "@/hooks/useStoreManagement";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import type { BenchmarkResponse, MarketProduct } from "@/types/benchmark";

const Benchmark = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<BenchmarkResponse | null>(null);
    const [initialSearch, setInitialSearch] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'single' | 'pareto' | 'catalog'>('single');
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

    useEffect(() => {
        const quickSearch = location.state?.quickSearch;
        const mode = location.state?.mode;

        // Handle deep linking
        if (mode === 'pareto') {
            setActiveTab('pareto');
        } else if (mode === 'single') {
            setActiveTab('single');
        } else if (mode === 'catalog') {
            setActiveTab('catalog');
        }

        if (quickSearch && typeof quickSearch === 'string') {
            setInitialSearch(quickSearch);
        }
    }, [location.state]);

    const handleParetoResults = (foundProducts: MarketProduct[]) => {
        if (foundProducts.length > 0) {
            setResults({
                products: foundProducts,
                searchQuery: 'Carga Masiva (Pareto)',
                timestamp: new Date().toISOString(),
                metadata: { model: 'Hybrid Scraper', confidenceLevel: 'high' }
            });
        }
    };

    const handleEanSearch = async (productName: string, ean: string | undefined, selectedStores: Store[]) => {
        // Call main search handler with Product Name and optional EAN filter
        await handleSearch(
            'product',
            productName, // Primary search parameter
            '', // no product type
            '', // no presentation
            selectedStores,
            { searchRecency: 'week', deepResearch: true },
            undefined, // no storeId
            undefined, // no keywords
            ean, // Optional EAN filter
            undefined, // no brand
            undefined, // no category
            undefined // no limit
        );
    };

    const handleSearch = async (
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
    ) => {
        setIsLoading(true);

        // Generar nuevo ID de sesión de búsqueda para Gemini
        const searchSessionId = `search_${Date.now()}_${btoa(encodeURIComponent(productName || 'catalog')).slice(0, 10)}`;

        // Limpiar chat de la búsqueda anterior
        const oldSessionId = sessionStorage.getItem('geminiSearchSessionId');
        if (oldSessionId) {
            sessionStorage.removeItem(`geminiChat_${oldSessionId}`);
        }

        // Establecer nuevo ID de sesión
        sessionStorage.setItem('geminiSearchSessionId', searchSessionId);

        setResults(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/price-scraper`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` // Required for Supabase functions
                },
                body: JSON.stringify({
                    searchMode,
                    productName: productName || undefined,
                    productType,
                    presentation,
                    selectedStores,
                    storeId,
                    advancedOptions,
                    keywords: keywords,
                    ean: ean,
                    brand: brand,
                    category: category,
                    productLimit: productLimit
                })
            });
            if (!response.ok) {
                if (response.status === 429) {
                    toast.error('Límite de búsquedas alcanzado. Por favor intenta más tarde.');
                    return;
                }
                if (response.status === 402) {
                    toast.error('Créditos agotados. Por favor contacta al administrador.');
                    return;
                }
                throw new Error('Error al realizar la búsqueda');
            }
            const data: BenchmarkResponse = await response.json();
            setResults(data);
            if (data.products.length === 0) {
                const searchDesc = searchMode === 'store-catalog'
                    ? `No se encontraron productos en el catálogo de la tienda`
                    : `No se encontró "${productName}" en las tiendas seleccionadas`;
                toast.info('No se encontraron productos', {
                    description: searchDesc
                });
            } else {
                const confidenceMsg = data.metadata?.confidenceLevel === 'high' ? ' (Alta confianza)' : data.metadata?.confidenceLevel === 'low' ? ' (Baja confianza)' : '';
                toast.success(`Se encontraron ${data.products.length} producto${data.products.length !== 1 ? 's' : ''}${confidenceMsg}`);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Error al buscar precios. Por favor intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };
    return <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 max-w-[1440px] mx-auto px-6 xl:px-12 py-12">
            <div className="max-w-[1440px] mx-auto px-6 xl:px-12 space-y-10">
                {/* Header & Search Control Section - Aligned and Premium */}
                {/* Header Section - Centered & Premium */}
                <div className="text-center space-y-4 max-w-2xl mx-auto animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                    >
                        <Search className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Buscador Inteligente v2.0</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter leading-none">
                        Comparador de <span className="text-emerald-500 italic">Precios</span>
                    </h1>
                    <p className="text-stone-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                        Analiza precios, disponibilidad y competencia en tiempo real.
                    </p>
                </div>

                {/* Control Center - Tabs & Actions */}
                <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-stone-100 shadow-sm">
                        <AnimatePresence>
                            {results && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9, width: 0, padding: 0 }}
                                    animate={{ opacity: 1, scale: 1, width: 'auto', padding: '0 12px' }}
                                    exit={{ opacity: 0, scale: 0.9, width: 0, padding: 0 }}
                                    onClick={() => setResults(null)}
                                    className="flex items-center gap-2 h-10 rounded-xl text-[10px] font-black text-stone-400 hover:text-rose-600 transition-all duration-300 hover:bg-rose-50 border-r border-stone-100 pr-3 mr-1 overflow-hidden whitespace-nowrap"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="tracking-widest uppercase">Reset</span>
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => {
                                setActiveTab('pareto');
                                setResults(null);
                            }}
                            className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 whitespace-nowrap ${activeTab === 'pareto' ? 'text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Zap className={`w-3.5 h-3.5 transition-transform duration-500 ${activeTab === 'pareto' ? 'scale-110' : 'scale-100 opacity-60'}`} />
                            <span className="tracking-widest uppercase">Masivos (Pareto)</span>
                            {activeTab === 'pareto' && (
                                <motion.div
                                    layoutId="activeTabPill"
                                    className="absolute inset-0 bg-stone-900 rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab('catalog');
                                setResults(null);
                            }}
                            className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 whitespace-nowrap ${activeTab === 'catalog' ? 'text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <StoreIcon className={`w-3.5 h-3.5 transition-transform duration-500 ${activeTab === 'catalog' ? 'scale-110' : 'scale-100 opacity-60'}`} />
                            <span className="tracking-widest uppercase">Por Catálogo</span>
                            {activeTab === 'catalog' && (
                                <motion.div
                                    layoutId="activeTabPill"
                                    className="absolute inset-0 bg-stone-900 rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab('single');
                                setResults(null);
                            }}
                            className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 whitespace-nowrap ${activeTab === 'single' ? 'text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Search className={`w-3.5 h-3.5 transition-transform duration-500 ${activeTab === 'single' ? 'scale-110' : 'scale-100 opacity-60'}`} />
                            <span className="tracking-widest uppercase">Localizador EAN</span>
                            {activeTab === 'single' && (
                                <motion.div
                                    layoutId="activeTabPill"
                                    className="absolute inset-0 bg-stone-900 rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Search Container with Glassmorphism */}
                <div className="relative group animate-slide-up">
                    {/* Decorative background glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative bg-white/80 backdrop-blur-xl border border-white p-2 rounded-[2.5rem] shadow-xl overflow-hidden">
                        <div className="p-1 md:p-2">
                            <AnimatePresence mode="wait">
                                {activeTab === 'single' && (
                                    <motion.div
                                        key="single"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <EanSearch
                                            onSearch={handleEanSearch}
                                            isLoading={isLoading}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'catalog' && (
                                    <motion.div
                                        key="catalog"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <BenchmarkSearch
                                            onSearch={handleSearch}
                                            isLoading={isLoading}
                                            mode="catalog"
                                            isRadar={false}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'pareto' && (
                                    <motion.div
                                        key="pareto"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ParetoInput onResultsFound={handleParetoResults} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="mt-8 animate-fade-in">
                        <LoadingProgress />
                    </div>
                )}

                {/* Results Notification / CTA Section */}
                {results && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-16 flex flex-col items-center justify-center space-y-8 pb-20"
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                            <div className="relative w-24 h-24 rounded-full bg-emerald-100 border-4 border-white shadow-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black text-stone-800 uppercase tracking-tight">¡Análisis Completado!</h2>
                            <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">
                                Se han procesado {results.products.length} productos satisfactoriamente.
                            </p>
                        </div>

                        <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className="group relative px-10 py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.2)] transition-all duration-500 hover:scale-105 active:scale-95 flex items-center gap-4 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                                    <LayoutDashboard className="w-5 h-5" />
                                    Visualizar Resultados
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 bg-stone-50 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                                <div className="h-full flex flex-col overflow-hidden">
                                    {/* Modal Header */}
                                    <div className="shrink-0 p-8 bg-white border-b border-stone-100 flex items-center justify-center relative">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tighter">Market Intelligence Report</h3>
                                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{results?.searchQuery} • {new Date(results?.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Body (Scrollable) */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                                        <div className="max-w-[1700px] mx-auto space-y-8 pb-12">
                                            <BenchmarkChart products={results.products} />
                                            <BenchmarkResults
                                                products={results.products}
                                                metadata={results.metadata}
                                                searchQuery={results.searchQuery || ''}
                                                timestamp={results.timestamp || new Date().toISOString()}
                                                isEanSearch={activeTab === 'single'}
                                            />


                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                )}


                {/* Empty State */}
                {!isLoading && !results && (
                    <div className="text-center py-12 space-y-4">
                        <div className="w-28 h-28 mx-auto rounded-full bg-white shadow-xl border border-primary/10 flex items-center justify-center p-2 transition-transform hover:scale-110 duration-500 ease-out group-hover:shadow-primary/20">
                            <img src="/nutresa-tree.png" alt="Nutresa" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                            Comienza buscando productos para comparar precios
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                            Con investigación profunda obtendrás datos más precisos y verificados
                        </p>
                    </div>
                )}
            </div>
        </main>

        <Footer />
    </div>;
};
export default Benchmark;
