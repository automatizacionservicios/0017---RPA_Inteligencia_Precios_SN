import { useState } from "react";

export interface Store {
    id: string;
    name: string;
    enabled: boolean;
}

export const useParetoStores = () => {
    const [stores, setStores] = useState<Store[]>([
        { id: 'jumbo', name: 'Jumbo', enabled: true },
        { id: 'olimpica', name: 'Olímpica', enabled: true },
        { id: 'exito', name: 'Éxito', enabled: true },
        { id: 'euro', name: 'Euro Supermercados', enabled: true },
        { id: 'vaquita', name: 'Vaquita Express', enabled: true },
        { id: 'megatiendas', name: 'Megatiendas', enabled: true },
        { id: 'mercacentro', name: 'Mercacentro', enabled: true },
        { id: 'zapatoca', name: 'Mercados Zapatoca', enabled: true },
        { id: 'nutresa', name: 'Nutresa en casa', enabled: true },
        { id: 'mundohuevo', name: 'Mundo Huevo', enabled: true },
        { id: 'farmatodo', name: 'Farmatodo', enabled: true },
        { id: 'mercaldas', name: 'Mercaldas', enabled: true },
        { id: 'supermu', name: 'Super Mu', enabled: true }
    ]);

    const handleStoreToggle = (storeId: string) => {
        setStores(prev => prev.map(s =>
            s.id === storeId ? { ...s, enabled: !s.enabled } : s
        ));
    };

    return {
        stores,
        setStores,
        handleStoreToggle,
        enabledStoresCount: stores.filter(s => s.enabled).length
    };
};
