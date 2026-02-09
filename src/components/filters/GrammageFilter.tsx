import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GrammageFilterProps {
  minGrams: number;
  maxGrams: number;
  gramRange: [number | null, number | null];
  onGramRangeChange: (range: [number | null, number | null]) => void;
}

export const GrammageFilter = ({
  minGrams,
  maxGrams,
  gramRange,
  onGramRangeChange
}: GrammageFilterProps) => {
  const handleMinGramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      onGramRangeChange([null, gramRange[1]]);
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    onGramRangeChange([numValue, gramRange[1]]);
  };

  const handleMaxGramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      onGramRangeChange([gramRange[0], null]);
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    onGramRangeChange([gramRange[0], numValue]);
  };

  const [showInputs, setShowInputs] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <Label className="text-[11px] font-black text-stone-800 uppercase tracking-widest">
            Dimensionamiento (G/ML)
          </Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInputs(!showInputs)}
          className="h-7 px-2 rounded-lg text-[10px] font-black text-emerald-600 hover:bg-emerald-50 transition-all uppercase tracking-tight gap-1.5"
        >
          {showInputs ? "Ocultar precisión" : "Ajuste preciso"}
          <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${showInputs ? "rotate-90" : ""}`} />
        </Button>
      </div>

      <AnimatePresence>
        {showInputs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 pb-6">
              <div className="space-y-1.5">
                <Label htmlFor="min-grams" className="text-[9px] font-black text-stone-400 uppercase tracking-tighter ml-1">
                  Mínimo
                </Label>
                <div className="relative group">
                  <Input
                    id="min-grams"
                    type="text"
                    inputMode="numeric"
                    value={gramRange[0] ?? ''}
                    onChange={handleMinGramChange}
                    placeholder="0"
                    className="pr-8 h-10 bg-white border-stone-100 rounded-xl font-mono text-[11px] font-bold text-stone-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-stone-300 pointer-events-none group-focus-within:text-emerald-500">
                    g
                  </span>
                </div>
              </div>

              <div className="pt-5">
                <ChevronRight className="w-3 h-3 text-stone-300" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max-grams" className="text-[9px] font-black text-stone-400 uppercase tracking-tighter ml-1">
                  Máximo
                </Label>
                <div className="relative group">
                  <Input
                    id="max-grams"
                    type="text"
                    inputMode="numeric"
                    value={gramRange[1] ?? ''}
                    onChange={handleMaxGramChange}
                    placeholder={maxGrams.toString()}
                    className="pr-8 h-10 bg-white border-stone-100 rounded-xl font-mono text-[11px] font-bold text-stone-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-stone-300 pointer-events-none group-focus-within:text-emerald-500">
                    g
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-1 pt-1">
        <Slider
          min={minGrams}
          max={maxGrams}
          step={10}
          value={[
            gramRange[0] ?? minGrams,
            gramRange[1] ?? maxGrams
          ]}
          onValueChange={(value) => onGramRangeChange(value as [number, number])}
          className="w-full"
        />
        <div className="flex justify-between mt-3 px-1">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-tighter">Base Detectada</span>
            <span className="text-[10px] font-bold text-stone-500">{minGrams}g</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-tighter">Techo Detectado</span>
            <span className="text-[10px] font-bold text-stone-500">{maxGrams}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};
