import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Coins, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  priceRange: [number | null, number | null];
  onPriceRangeChange: (range: [number | null, number | null]) => void;
}

export const PriceFilter = ({
  minPrice,
  maxPrice,
  priceRange,
  onPriceRangeChange,
}: PriceFilterProps) => {
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value === '') {
      onPriceRangeChange([null, priceRange[1]]);
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    onPriceRangeChange([numValue, priceRange[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value === '') {
      onPriceRangeChange([priceRange[0], null]);
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    onPriceRangeChange([priceRange[0], numValue]);
  };

  const [showInputs, setShowInputs] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Coins className="w-4 h-4" />
          </div>
          <Label className="text-[11px] font-black text-stone-800 uppercase tracking-widest">
            Rango de Inversión
          </Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInputs(!showInputs)}
          className="h-7 px-2 rounded-lg text-[10px] font-black text-emerald-600 hover:bg-emerald-50 transition-all uppercase tracking-tight gap-1.5"
        >
          {showInputs ? 'Ocultar precisión' : 'Ajuste preciso'}
          <ChevronRight
            className={`w-3 h-3 transition-transform duration-300 ${showInputs ? 'rotate-90' : ''}`}
          />
        </Button>
      </div>

      <AnimatePresence>
        {showInputs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 pb-6">
              <div className="space-y-1.5">
                <Label
                  htmlFor="min-price"
                  className="text-[9px] font-black text-stone-400 uppercase tracking-tighter ml-1"
                >
                  Desde
                </Label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-stone-400 pointer-events-none transition-colors group-focus-within:text-emerald-500">
                    $
                  </span>
                  <Input
                    id="min-price"
                    type="text"
                    inputMode="numeric"
                    value={priceRange[0] !== null ? priceRange[0].toLocaleString('es-CO') : ''}
                    onChange={handleMinPriceChange}
                    placeholder="0"
                    className="pl-7 h-10 bg-white border-stone-100 rounded-xl font-mono text-[11px] font-bold text-stone-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-5">
                <ChevronRight className="w-3 h-3 text-stone-300" />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="max-price"
                  className="text-[9px] font-black text-stone-400 uppercase tracking-tighter ml-1"
                >
                  Hasta
                </Label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-stone-400 pointer-events-none transition-colors group-focus-within:text-emerald-500">
                    $
                  </span>
                  <Input
                    id="max-price"
                    type="text"
                    inputMode="numeric"
                    value={priceRange[1] !== null ? priceRange[1].toLocaleString('es-CO') : ''}
                    onChange={handleMaxPriceChange}
                    placeholder={maxPrice.toLocaleString('es-CO')}
                    className="pl-7 h-10 bg-white border-stone-100 rounded-xl font-mono text-[11px] font-bold text-stone-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-1 pt-1">
        <Slider
          min={minPrice}
          max={maxPrice}
          step={100}
          value={[priceRange[0] ?? minPrice, priceRange[1] ?? maxPrice]}
          onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          className="w-full"
        />
        <div className="flex justify-between mt-3 px-1">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-tighter">
              Min. Detectado
            </span>
            <span className="text-[10px] font-bold text-stone-500">
              ${minPrice.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-tighter">
              Máx. Detectado
            </span>
            <span className="text-[10px] font-bold text-stone-500">
              ${maxPrice.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
