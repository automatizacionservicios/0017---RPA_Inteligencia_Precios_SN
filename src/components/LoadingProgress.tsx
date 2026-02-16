import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

const LoadingProgress = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto mt-12 mb-20 p-10 rounded-[40px] bg-white border border-stone-100 shadow-2xl relative overflow-hidden group"
    >
      {/* Decorative pulse background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 border border-emerald-50">
            <img src="/nutresa-tree.png" alt="Nutresa" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xl font-black text-stone-800 uppercase tracking-tighter flex items-center justify-center gap-2">
            Sincronizando Radar
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
          </h4>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Consultando 16 canales de Retail en Colombia
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
              Estado: Orquestando Scrapers
            </span>
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          </div>

          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <div className="flex justify-center pt-2">
            <span className="text-[8px] font-bold text-stone-300 uppercase tracking-[0.3em] animate-pulse">
              Deep Intelligence Processing
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingProgress;
