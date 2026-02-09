import { Navigation } from "lucide-react";
import { motion } from "framer-motion";

export const SearchHeader = () => {
    return (
        <div className="text-center space-y-4 max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Motor de Inteligencia v2.0</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter leading-none">
                Radar <span className="text-emerald-500 italic">Referencial</span>
            </h1>
            <p className="text-stone-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                Sistema Híbrido de Deep-Linking para monitoreo competitivo en tiempo real.
            </p>
        </div>
    );
}
