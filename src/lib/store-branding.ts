export interface StoreBrand {
    icon: string | null;
    color: string;
    name: string;
    url?: string;
    status?: 'online' | 'manual' | 'maintenance' | 'coming_soon';
}

export const STORE_BRANDING: Record<string, StoreBrand> = {
    carulla: { icon: '/stores/carulla.png', color: '#7FD13B', name: 'Carulla', url: 'https://www.carulla.com', status: 'online' },
    megatiendas: { icon: '/stores/megatiendas.jpg', color: '#E31E24', name: 'Megatiendas', url: 'https://www.megatiendas.co' },
    jumbo: { icon: '/stores/jumbo.png', color: '#ED1C24', name: 'Jumbo', url: 'https://www.jumbo.co', status: 'online' },
    olimpica: { icon: '/stores/olimpica.png', color: '#D2102E', name: 'Olímpica', url: 'https://www.olimpica.com' },
    exito: { icon: '/stores/exito.png', color: '#FFD100', name: 'Éxito', url: 'https://www.exito.com', status: 'online' },
    euro: { icon: '/stores/euro.jpg', color: '#008C45', name: 'Euro', url: 'https://eurosupermercados.com', status: 'online' },
    vaquita: { icon: '/stores/vaquita.png', color: '#F8B133', name: 'Vaquita', url: 'https://lavaquita.co' },
    mercacentro: { icon: '/stores/mercacentro.jpg', color: '#1B4F9C', name: 'Mercacentro', url: 'https://mercacentro.com' },
    zapatoca: { icon: '/stores/zapatoca.jpg', color: '#E31E24', name: 'Zapatoca', url: 'https://supermercadoflorez.com' },
    nutresacas: { icon: '/nutresa-tree.png', color: '#00A859', name: 'Nutresa en Casa', url: 'https://tiendanutresaencasa.com' },
    nutresa: { icon: '/nutresa-tree.png', color: '#00A859', name: 'Nutresa' },
    mundohuevo: { icon: '/stores/mundohuevo.jpg', color: '#F8941C', name: 'Mundo Huevo', url: 'https://mundohuevo.com' },
    farmatodo: { icon: '/stores/farmatodo.png', color: '#0082c1', name: 'Farmatodo', url: 'https://farmatodo.com.co' },
    d1: { icon: '/stores/d1.png', color: '#ED1C24', name: 'Tiendas D1', url: 'https://tiendasd1.com' },
    makro: { icon: '/stores/makro.png', color: '#E31E24', name: 'Makro', url: 'https://makro.com.co' },
    mercaldas: { icon: '/stores/mercaldas.png', color: '#008C45', name: 'Mercaldas', url: 'https://www.mercaldas.com' },
    supermu: { icon: '/stores/supermu.png', color: '#E30613', name: 'Super Mu', url: 'https://supermu.com' },
};

export const getStoreBrand = (storeName: string): StoreBrand => {
    if (!storeName) return { icon: null, color: '#A8A29E', name: 'Unknown' };

    const normalized = storeName.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (normalized.includes('carulla')) return STORE_BRANDING.carulla;
    if (normalized.includes('euro')) return STORE_BRANDING.euro;
    if (normalized.includes('jumbo')) return STORE_BRANDING.jumbo;
    if (normalized.includes('megatiendas')) return STORE_BRANDING.megatiendas;
    if (normalized.includes('olimpica')) return STORE_BRANDING.olimpica;
    if (normalized.includes('nutresa')) return STORE_BRANDING.nutresa;
    if (normalized.includes('exito')) return STORE_BRANDING.exito;
    if (normalized.includes('vaquita')) return STORE_BRANDING.vaquita;
    if (normalized.includes('mercacentro')) return STORE_BRANDING.mercacentro;
    if (normalized.includes('zapatoca')) return STORE_BRANDING.zapatoca;

    if (normalized.includes('mundohuevo') || normalized.includes('mundo huevo')) return STORE_BRANDING.mundohuevo;
    if (normalized.includes('farmatodo')) return STORE_BRANDING.farmatodo;
    if (normalized.includes('d1')) return STORE_BRANDING.d1;
    if (normalized.includes('makro')) return STORE_BRANDING.makro;

    if (normalized.includes('mercaldas')) return STORE_BRANDING.mercaldas;
    if (normalized.includes('super mu') || normalized.includes('supermu')) return STORE_BRANDING.supermu;

    return { icon: null, color: '#A8A29E', name: storeName };
};
