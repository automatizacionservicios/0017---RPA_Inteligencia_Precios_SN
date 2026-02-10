import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Barcode, Store as StoreIcon, Sparkles, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getStoreBrand } from "@/lib/store-branding";
import { Badge } from "@/components/ui/badge";
import type { Store } from "@/hooks/useStoreManagement";


interface EanSearchProps {
    onSearch: (productName: string, ean: string | undefined, selectedStores: Store[]) => void;
    isLoading: boolean;
}

const EanSearch = ({ onSearch, isLoading }: EanSearchProps) => {
    const [productName, setProductName] = useState("");
    const [eanCode, setEanCode] = useState("");

    // All stores support EAN search
    const [stores, setStores] = useState<Store[]>([
        { id: 'carulla', name: 'Carulla', enabled: true, urls: ['carulla.com'] },
        { id: 'jumbo', name: 'Jumbo', enabled: true, urls: ['jumbo.com.co'] },
        { id: 'olimpica', name: 'Olímpica', enabled: true, urls: ['olimpica.com'] },
        { id: 'exito', name: 'Éxito', enabled: true, urls: ['exito.com'] },
        { id: 'd1', name: 'Tiendas D1', enabled: true, urls: ['domicilios.tiendasd1.com'] },
        { id: 'makro', name: 'Makro', enabled: true, urls: ['tienda.makro.com.co'] },
        { id: 'euro', name: 'Euro Supermercados', enabled: true, urls: ['www.eurosupermercados.com.co'] },
        { id: 'vaquita', name: 'Vaquita Express', enabled: true, urls: ['vaquitaexpress.com.co'] },
        { id: 'megatiendas', name: 'Megatiendas', enabled: true, urls: ['www.megatiendas.co'] },
        { id: 'mercacentro', name: 'Mercacentro', enabled: true, urls: ['www.mercacentro.com'] },
        { id: 'zapatoca', name: 'Mercados Zapatoca', enabled: true, urls: ['mercadozapatoca.com'] },
        { id: 'nutresa', name: 'Nutresa en casa', enabled: true, urls: ['tiendanutresaencasa.com'] },
        { id: 'mundohuevo', name: 'Mundo Huevo', enabled: true, urls: ['mundohuevo.com'] },
        { id: 'farmatodo', name: 'Farmatodo', enabled: true, urls: ['farmatodo.com.co'] },
        { id: 'mercaldas', name: 'Mercaldas', enabled: true, urls: ['mercaldas.com'] },
        { id: 'supermu', name: 'Super Mu', enabled: true, urls: ['supermu.com'] }
    ]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName.trim()) return;

        const selectedStores = stores.filter(s => s.enabled);
        onSearch(productName.trim(), eanCode.trim() || undefined, selectedStores);
    };

    const toggleStore = (storeId: string) => {
        setStores(stores.map(s =>
            s.id === storeId ? { ...s, enabled: !s.enabled } : s
        ));
    };

    const toggleAll = () => {
        const allEnabled = stores.every(s => s.enabled);
        setStores(stores.map(s => ({ ...s, enabled: !allEnabled })));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {/* Hero Section with Context */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 border border-emerald-100 shadow-lg shadow-emerald-500/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/10 to-emerald-400/10 rounded-full blur-3xl -ml-24 -mb-24" />

                <div className="relative flex items-start gap-6">
                    <div className="p-4 rounded-2xl bg-white shadow-xl shadow-emerald-500/20 border border-emerald-100">
                        <Sparkles className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                                Localizador de EAN
                            </h2>
                            <Badge className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5">
                                INTELIGENTE
                            </Badge>
                        </div>
                        <p className="text-sm font-bold text-emerald-900/70 leading-relaxed mb-3">
                            Busca productos por nombre y descubre sus códigos EAN/GTIN en el mercado
                        </p>
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100/50">
                            <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] font-bold text-stone-600 leading-relaxed">
                                <span className="text-emerald-700 font-black">¿Cómo funciona?</span> Ingresa el nombre del producto que buscas.
                                El sistema rastreará las tiendas seleccionadas y te mostrará los códigos EAN encontrados para ese producto.
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
                        <Label htmlFor="productName" className="text-lg font-black text-stone-800 uppercase tracking-tight">
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
                        <Label htmlFor="ean" className="text-sm font-black text-stone-600 uppercase tracking-tight">
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
                        Red de Búsqueda ({stores.filter(s => s.enabled).length})
                    </Label>
                    <button
                        type="button"
                        onClick={toggleAll}
                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                        {stores.every(s => s.enabled) ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stores.map((store) => {
                        const branding = getStoreBrand(store.id);
                        return (
                            <label
                                key={store.id}
                                className={`
                                    relative flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-300 group
                                    ${store.enabled
                                        ? 'border-emerald-500/50 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                                        : 'border-stone-100 bg-white hover:border-emerald-200 hover:shadow-md'
                                    }
                                `}
                            >
                                <Checkbox
                                    checked={store.enabled}
                                    onCheckedChange={() => toggleStore(store.id)}
                                    disabled={isLoading}
                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm border border-stone-100 overflow-hidden"
                                    >
                                        {branding.icon ? (
                                            <img src={branding.icon} alt={store.name} className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <StoreIcon className="w-4 h-4 text-stone-300" />
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wide truncate ${store.enabled ? 'text-stone-900' : 'text-stone-500 group-hover:text-stone-700'}`}>
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
                        <span className="font-black tracking-[0.2em] text-xs">LOCALIZANDO CÓDIGOS EAN...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-black tracking-[0.2em] text-xs">BUSCAR CÓDIGOS EAN • {stores.filter(s => s.enabled).length} TIENDAS</span>
                    </div>
                )}
            </Button>
        </form>
    );
};

export default EanSearch;
