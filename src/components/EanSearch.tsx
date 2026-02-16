import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Barcode, Store as StoreIcon, Sparkles, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getStoreBrand } from '@/lib/store-branding';
import { Badge } from '@/components/ui/badge';
import { useStoreManagement, type Store } from '@/hooks/useStoreManagement';
import { AnimatePresence, motion } from 'framer-motion';

interface EanSearchProps {
  /**
   * Callback executed when a search is triggered.
   * @param productName - Name of the product to search.
   * @param ean - Optional EAN code to filter results.
   * @param selectedStores - List of stores enabled for this search.
   */
  onSearch: (
    productName: string,
    ean: string | undefined,
    selectedStores: Store[]
  ) => void | Promise<void>;
  /** Loading state from the parent component */
  isLoading: boolean;
}

/**
 * EAN Localizer Component.
 * Enables users to find EAN/GTIN codes by product name across multiple retailers.
 * Uses useStoreManagement for consistent store handling.
 */
const EanSearch = ({ onSearch, isLoading }: EanSearchProps) => {
  const [productName, setProductName] = useState('');
  const [eanCode, setEanCode] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use centralized store management (EAN mode by default for this component)
  const { filteredStores, handleStoreToggle, handleSelectAllStores } = useStoreManagement(
    false,
    'ean'
  );

  /**
   * Handles the form submission.
   * Validates input and triggers the search callback with selected stores.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsCollapsed(true);
    const selectedStores = filteredStores.filter((s) => s.enabled);
    onSearch(productName.trim(), eanCode.trim() || undefined, selectedStores);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 bg-emerald-900 border border-emerald-400/20 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-900/40 mx-8"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-white shadow-xl shadow-emerald-500/20 text-emerald-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">
                  Radar EAN Activo
                </p>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">
                  "{productName}"
                </h3>
                {eanCode && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-none mt-2 font-bold px-3">
                    Filtro EAN: {eanCode}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-white rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Sincronizando...
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setIsCollapsed(false)}
                className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all text-[10px]"
              >
                Refinar Localización
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8 p-8 max-w-5xl mx-auto">
              {/* Hero Section with Context */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 border border-emerald-100 shadow-lg shadow-emerald-500/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/10 to-emerald-400/10 rounded-full blur-3xl -ml-24 -mb-24" />

                <div className="relative flex items-start gap-6">
                  <div className="p-4 rounded-2xl bg-white shadow-xl shadow-emerald-500/20 border border-emerald-100">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                          Localizador de EAN
                        </h2>
                        <Badge className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5">
                          INTELIGENTE
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-900/70 leading-relaxed mb-3">
                      Busca productos por nombre y descubre sus códigos EAN/GTIN en el mercado
                    </p>
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100/50">
                      <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] font-bold text-stone-600 leading-relaxed">
                        <span className="text-emerald-700 font-black">¿Cómo funciona?</span> Ingresa
                        el nombre del producto que buscas. El sistema rastreará las tiendas
                        seleccionadas y te mostrará los códigos EAN encontrados para ese producto.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Input: Product Name */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-white">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <Label
                      htmlFor="productName"
                      className="text-lg font-black text-stone-800 uppercase tracking-tight"
                    >
                      Nombre del Producto
                    </Label>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                      Campo Principal • Requerido
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                  <Input
                    id="productName"
                    type="text"
                    placeholder="Ej: Coca Cola 400ml, Arroz Diana 500g, Aceite Girasol..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="relative h-16 px-6 text-lg font-semibold bg-white border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl shadow-sm transition-all placeholder:text-stone-300 placeholder:font-normal"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Secondary Input: EAN (Optional Filter) */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-stone-100 text-stone-500">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <div>
                    <Label
                      htmlFor="ean"
                      className="text-sm font-black text-stone-600 uppercase tracking-tight"
                    >
                      Código EAN / GTIN
                    </Label>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                      Opcional • Para Filtrar o Validar
                    </p>
                  </div>
                </div>

                <Input
                  id="ean"
                  type="text"
                  placeholder="Ej: 7702001028894 (opcional)"
                  value={eanCode}
                  onChange={(e) => setEanCode(e.target.value)}
                  className="h-12 px-5 text-base font-medium bg-stone-50 border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl shadow-sm transition-all placeholder:text-stone-300"
                  disabled={isLoading}
                />
              </div>

              {/* Store Selection */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">
                    Red de Búsqueda ({filteredStores.filter((s) => s.enabled).length})
                  </Label>
                  <button
                    type="button"
                    onClick={handleSelectAllStores}
                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    {filteredStores.every((s) => s.enabled)
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredStores.map((store) => {
                    const branding = getStoreBrand(store.id);
                    return (
                      <label
                        key={store.id}
                        className={`
                                    relative flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-300 group
                                    ${
                                      store.enabled
                                        ? 'border-emerald-500/50 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                                        : 'border-stone-100 bg-white hover:border-emerald-200 hover:shadow-md'
                                    }
                                `}
                      >
                        <Checkbox
                          checked={store.enabled}
                          onCheckedChange={() => handleStoreToggle(store.id)}
                          disabled={isLoading}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm border border-stone-100 overflow-hidden">
                            {branding.icon ? (
                              <img
                                src={branding.icon}
                                alt={store.name}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <StoreIcon className="w-4 h-4 text-stone-300" />
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold uppercase tracking-wide truncate ${store.enabled ? 'text-stone-900' : 'text-stone-500 group-hover:text-stone-700'}`}
                          >
                            {store.name}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Main Action */}
              <Button
                type="submit"
                disabled={isLoading || !productName.trim()}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/20 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="font-black tracking-[0.2em] text-xs">
                      LOCALIZANDO CÓDIGOS EAN...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-black tracking-[0.2em] text-xs">
                      BUSCAR CÓDIGOS EAN • {filteredStores.filter((s) => s.enabled).length} TIENDAS
                    </span>
                  </div>
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EanSearch;
