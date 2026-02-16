import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tag, CheckCircle2, Circle } from 'lucide-react';

interface BrandFilterProps {
  brands: string[];
  selectedBrands: string[];
  onBrandToggle: (brand: string) => void;
  onToggleAll: () => void;
}

export const BrandFilter = ({
  brands,
  selectedBrands,
  onBrandToggle,
  onToggleAll,
}: BrandFilterProps) => {
  const allSelected = selectedBrands.length === brands.length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Tag className="w-4 h-4" />
          </div>
          <Label className="text-[11px] font-black text-stone-800 uppercase tracking-widest">
            Marcas Detectadas
          </Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAll}
          className="h-auto p-0 text-[10px] font-black text-emerald-600 hover:text-emerald-700 hover:bg-transparent transition-colors uppercase tracking-widest"
        >
          {allSelected ? 'Deseleccionar' : 'Seleccionar todas'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {brands.map((brand) => {
          const isSelected = selectedBrands.includes(brand);
          return (
            <div
              key={brand}
              onClick={() => onBrandToggle(brand)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer group ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-100 shadow-sm'
                  : 'bg-white border-stone-100 hover:border-stone-200'
              }`}
            >
              <span
                className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                  isSelected ? 'text-emerald-700' : 'text-stone-500 group-hover:text-stone-700'
                }`}
              >
                {brand}
              </span>

              <div
                className={`transition-all duration-300 ${isSelected ? 'scale-110' : 'scale-100 opacity-20 group-hover:opacity-40'}`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
