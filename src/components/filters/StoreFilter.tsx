import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Store, CheckCircle2, Circle } from 'lucide-react';
import { getStoreBrand } from '@/lib/store-branding';

interface StoreFilterProps {
  stores: string[];
  selectedStores: string[];
  onStoreToggle: (store: string) => void;
  onToggleAll: () => void;
}

export const StoreFilter = ({
  stores,
  selectedStores,
  onStoreToggle,
  onToggleAll,
}: StoreFilterProps) => {
  const safeStores = stores.filter((s) => typeof s === 'string' && s.length > 0);
  const allSelected = selectedStores.length > 0 && selectedStores.length >= safeStores.length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Store className="w-4 h-4" />
          </div>
          <Label className="text-[11px] font-black text-stone-800 uppercase tracking-widest">
            Canales / Tiendas ({safeStores.length})
          </Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleAll();
          }}
          className="h-auto p-0 text-[10px] font-black text-emerald-600 hover:text-emerald-700 hover:bg-transparent transition-colors uppercase tracking-widest"
        >
          {allSelected ? 'Deseleccionar' : 'Seleccionar todas'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {safeStores.map((store) => {
          const isSelected = selectedStores.includes(store);
          const brand = getStoreBrand(store);
          if (!brand) return null; // Safety check

          return (
            <div
              key={store}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStoreToggle(store);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer group select-none ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-100 shadow-sm'
                  : 'bg-white border-stone-100 hover:border-stone-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center bg-white shadow-sm transition-all ${
                    isSelected ? 'border-emerald-200' : 'border-stone-100'
                  }`}
                >
                  {brand.icon ? (
                    <img
                      src={brand.icon}
                      alt={brand.name || store}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Store className="w-4 h-4 text-stone-200" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                    isSelected ? 'text-emerald-700' : 'text-stone-500 group-hover:text-stone-700'
                  }`}
                >
                  {brand.name || store}
                </span>
              </div>

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
