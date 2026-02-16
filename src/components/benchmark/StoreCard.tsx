import { motion } from 'framer-motion';
import { Store as StoreIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getStoreBrand } from '@/lib/store-branding';
import { Store } from '@/hooks/useStoreManagement';

interface StoreCardProps {
  store: Store;
  isEanMode: boolean;
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
  isCustom?: boolean;
  index: number;
}

export const StoreCard = ({
  store,
  isEanMode,
  onToggle,
  onRemove,
  isCustom,
  index,
}: StoreCardProps) => {
  const brand = getStoreBrand(store.name);
  const isManual = brand.status === 'manual';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none ${
        isEanMode
          ? 'bg-stone-50/50 border-stone-100 opacity-100 cursor-default'
          : store.enabled
            ? 'bg-emerald-50 border-emerald-100 shadow-sm cursor-pointer group hover:scale-[1.02] active:scale-95'
            : 'bg-white border-stone-100 hover:border-stone-200 opacity-60 grayscale hover:grayscale-0 cursor-pointer group hover:scale-[1.02] active:scale-95'
      }`}
      onClick={(e) => {
        if (isEanMode) return;
        e.preventDefault();
        e.stopPropagation();
        onToggle(store.id);
      }}
    >
      <div className="flex items-center gap-3 w-full min-w-0">
        <div
          className={`w-9 h-9 rounded-xl overflow-hidden shadow-sm border flex-shrink-0 flex items-center justify-center bg-white transition-all ${
            isEanMode || store.enabled
              ? 'border-emerald-200 ring-2 ring-emerald-500/20'
              : 'border-stone-100'
          }`}
        >
          {brand.icon ? (
            <img src={brand.icon} alt={store.name} className="w-full h-full object-contain p-1" />
          ) : (
            <StoreIcon className="w-4 h-4 text-stone-300" />
          )}
        </div>
        <div className="flex flex-col min-w-0 pr-2">
          <Label
            htmlFor={store.id}
            className={`text-[11px] font-black uppercase tracking-tight leading-tight transition-colors truncate ${
              isEanMode || store.enabled ? 'text-emerald-700' : 'text-stone-500'
            } ${isEanMode ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={(e) => {
              if (isEanMode) e.preventDefault();
              else e.stopPropagation();
            }}
          >
            {store.name}
          </Label>
          {isEanMode && isManual && (
            <span className="text-[7px] font-black text-amber-600 uppercase tracking-tighter mt-0.5">
              Consulta Manual
            </span>
          )}
        </div>
      </div>
      {!isEanMode && (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            id={store.id}
            checked={store.enabled}
            onCheckedChange={() => onToggle(store.id)}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none h-4 w-4 rounded-md flex-shrink-0"
          />
          {isCustom && onRemove && (
            <button
              type="button"
              aria-label="Eliminar tienda"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(store.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
