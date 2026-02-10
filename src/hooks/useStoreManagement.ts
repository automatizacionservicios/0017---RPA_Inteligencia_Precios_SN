import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { isEanOnly, canSearchByEan } from "@/lib/store-capabilities";

export interface Store {
    id: string;
    name: string;
    enabled: boolean;
    urls: string[];
}

export interface AdvancedOptions {
    searchRecency: 'day' | 'week' | 'month';
    deepResearch: boolean;
}

export const manualStoreIds = [];


export const useStoreManagement = (isRadar: boolean, activeTab: string) => {
    useEffect(() => {
        // Limpieza de tiendas personalizadas antiguas (Seguridad)
        localStorage.removeItem('customBenchmarkStores');
    }, []);

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
        { id: 'supermu', name: 'Super Mu', enabled: true, urls: ['supermu.com'] },
        { id: 'rappi', name: 'Rappi', enabled: true, urls: ['rappi.com.co'] }
    ]);

    const visibleStores = useMemo(() => {
        if (activeTab === 'name') return stores; // All stores support Name search (16)
        return stores.filter(s => canSearchByEan(s.id)); // Only some support EAN (13)
    }, [stores, activeTab]);


    const manualStoreIds_hook = manualStoreIds;
    const filteredStores = isRadar
        ? visibleStores
        : visibleStores.filter(s => !manualStoreIds_hook.includes(s.id));

    const handleStoreToggle = (storeId: string) => {
        setStores(prev => prev.map(s =>
            s.id === storeId ? { ...s, enabled: !s.enabled } : s
        ));
    };

    const handleSelectAllStores = () => {
        const allEnabled = stores.every(s => s.enabled);
        setStores(prev => prev.map(s => ({ ...s, enabled: !allEnabled })));
    };

    return {
        stores,
        filteredStores,
        handleStoreToggle,
        handleSelectAllStores,
        enabledStoresCount: filteredStores.filter(s => s.enabled).length
    };
};
