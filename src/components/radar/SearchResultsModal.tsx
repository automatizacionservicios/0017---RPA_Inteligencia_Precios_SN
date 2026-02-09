import { motion } from "framer-motion";
import { CheckCircle2, LayoutDashboard, Sparkles, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ProductCard } from "./ProductCard";
import BenchmarkResults from "@/components/BenchmarkResults";
import type { BenchmarkResponse } from "@/types/benchmark";

interface SearchResultsModalProps {
    results: BenchmarkResponse;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SearchResultsModal = ({ results, isOpen, onOpenChange }: SearchResultsModalProps) => {
    const directProducts = results.products.filter(p => !(p as any).isExternalLink);
    const externalProducts = results.products.filter(p => (p as any).isExternalLink);

    return (
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
                <h2 className="text-3xl font-black text-stone-800 uppercase tracking-tight">Análisis Híbrido Listo</h2>
                <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">
                    Resultados directos y accesos externos disponibles.
                </p>
            </div>

            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    <button className="group relative px-10 py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:scale-105 transition-all duration-500 flex items-center gap-4 overflow-hidden">
                        <LayoutDashboard className="w-5 h-5" />
                        Explorar Panel Radar
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 bg-stone-50 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="h-full flex flex-col overflow-hidden">
                        <div className="shrink-0 p-8 bg-white border-b border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-stone-800 uppercase tracking-tighter">Radar Referencial v2.0</h3>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Búsqueda: {results.searchQuery}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <div className="max-w-6xl mx-auto space-y-12 pb-12">

                                {directProducts.length > 0 && (
                                    <section>
                                        <h4 className="text-[12px] font-black text-stone-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                            Tiendas con Acceso Directo
                                            <div className="h-px flex-1 bg-stone-100" />
                                        </h4>
                                        <BenchmarkResults
                                            products={directProducts}
                                            searchQuery={results.searchQuery}
                                            timestamp={results.timestamp}
                                        />
                                    </section>
                                )}

                                {externalProducts.length > 0 && (
                                    <section className="pt-8">
                                        <h4 className="text-[12px] font-black text-stone-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                            Canales con Consulta Externa
                                            <div className="h-px flex-1 bg-stone-100" />
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {externalProducts.map((p, i) => (
                                                <ProductCard key={i} product={p} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 flex gap-6 items-start">
                                    <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm border border-blue-50">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[12px] font-black text-blue-900 uppercase tracking-widest">Información Técnica</h5>
                                        <p className="text-blue-800/70 text-sm leading-relaxed font-medium">
                                            Las tiendas con consulta externa utilizan arquitecturas cifradas (Next.js App Router / CSR) que impiden la sincronización automática.
                                            El sistema construye el enlace inteligente para optimizar su búsqueda manual.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};
