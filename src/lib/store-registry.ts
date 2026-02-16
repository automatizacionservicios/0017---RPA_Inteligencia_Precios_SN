import { Store } from '@/types/store';

/**
 * Única fuente de verdad para todas las tiendas soportadas por la aplicación.
 * Todos los IDs de tiendas aquí deben coincidir con las estrategias en el backend (price-scraper).
 */
export const SUPPORTED_STORES: Store[] = [
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
  { id: 'rappi', name: 'Rappi', enabled: true, urls: ['rappi.com.co'] },
];

/**
 * Ayudante para obtener una copia de las tiendas con el estado 'enabled' por defecto
 */
export const getDefaultStoreList = (): Store[] => {
  return SUPPORTED_STORES.map((s) => ({ ...s }));
};
