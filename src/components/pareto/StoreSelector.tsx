import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Store } from '@/hooks/useParetoStores';

interface StoreSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  onToggle: (id: string) => void;
}

export const StoreSelector = ({ open, onOpenChange, stores, onToggle }: StoreSelectorProps) => {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleContent className="pt-4 animate-in slide-in-from-top-2">
        <div className="p-6 rounded-[24px] bg-white border border-stone-100 shadow-xl shadow-stone-200/50 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 ${
                store.enabled
                  ? 'bg-emerald-50/50 border-emerald-500/20 shadow-sm'
                  : 'bg-stone-50 border-stone-100 opacity-60 grayscale hover:grayscale-0'
              }`}
              onClick={() => onToggle(store.id)}
            >
              <Checkbox
                id={`store-${store.id}`}
                checked={store.enabled}
                onCheckedChange={() => onToggle(store.id)}
                className={`transition-all ${store.enabled ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none' : 'border-stone-300'}`}
              />
              <label
                htmlFor={`store-${store.id}`}
                className={`text-[10px] font-black cursor-pointer uppercase tracking-tight truncate ${store.enabled ? 'text-emerald-800' : 'text-stone-500'}`}
              >
                {store.name}
              </label>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
