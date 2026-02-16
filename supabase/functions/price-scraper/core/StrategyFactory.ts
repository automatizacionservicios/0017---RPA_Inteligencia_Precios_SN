/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import { ISearchStrategy } from '../interfaces/ISearchStrategy.ts';
import { FarmatodoStrategy } from '../strategies/FarmatodoStrategy.ts';
import { VtexStrategy } from '../strategies/VtexStrategy.ts';
import { CheerioStrategy } from '../strategies/CheerioStrategy.ts';
import { InstaleapStrategy } from '../strategies/InstaleapStrategy.ts';
import { RappiStrategy } from '../strategies/RappiStrategy.ts';

/**
 * Fábrica de Estrategias de Búsqueda (StrategyFactory).
 *
 * Centraliza la configuración de todas las tiendas soportadas y se encarga de
 * instanciar la clase de estrategia correcta según el método de scraping
 * definido para cada una (VTEX, Cheerio, Instaleap, etc.).
 */
export class StrategyFactory {
  /**
   * Configuración maestro de tiendas.
   * Define dominios, selectores CSS y métodos de recolección a nivel NACIONAL.
   */
  private static STORE_CONFIG: Record<string, any> = {
    exito: {
      domains: ['www.exito.com'],
      vtexDomain: 'www.exito.com',
      scrapeMethod: 'vtex',
      name: 'ÉXITO',
    },
    jumbo: {
      domains: ['www.jumbocolombia.com'],
      vtexDomain: 'www.jumbocolombia.com',
      scrapeMethod: 'vtex',
      name: 'JUMBO',
    },
    olimpica: {
      domains: ['www.olimpica.com'],
      vtexDomain: 'www.olimpica.com',
      scrapeMethod: 'vtex',
      name: 'OLÍMPICA',
    },
    euro: {
      domains: ['www.eurosupermercados.com.co'],
      vtexDomain: 'www.eurosupermercados.com.co',
      scrapeMethod: 'vtex',
      name: 'EURO SUPERMERCADOS',
    },
    megatiendas: {
      domains: ['www.megatiendas.co'],
      vtexDomain: 'www.megatiendas.co',
      scrapeMethod: 'vtex',
      name: 'MEGATIENDAS',
    },
    mercacentro: {
      domains: ['www.mercacentro.com'],
      vtexDomain: 'www.mercacentro.com',
      scrapeMethod: 'vtex',
      name: 'MERCACENTRO',
    },
    nutresa: {
      domains: ['www.tiendanutresaencasa.com'],
      vtexDomain: 'www.tiendanutresaencasa.com',
      scrapeMethod: 'vtex-io',
      name: 'NUTRESA EN CASA',
    },
    mercaldas: {
      domains: ['www.mercaldas.com'],
      vtexDomain: 'www.mercaldas.com',
      scrapeMethod: 'vtex',
      name: 'MERCALDAS',
    },
    zapatoca: {
      domains: ['www.mercadozapatoca.com'],
      scrapeMethod: 'cheerio',
      name: 'ZAPATOCA',
      searchPath: '/search/?k=',
      selectors: {
        productCard: '#categorias .dpr_container',
        name: '.dpr_product-name',
        price: '.dpr_listprice, #itempropprice, #product_price',
        regularPrice: '.dpr_suggested_price, .dpr_oldprice, .suggested_price',
        url: 'a.dpr_listname, a[itemprop="url"]',
        image: '.dpr_imagen_thumb img, #product_gallery img',
      },
    },
    carulla: {
      domains: ['carulla.com'],
      scrapeMethod: 'cheerio',
      name: 'CARULLA',
      searchPath: '/s?q=',
      selectors: {
        productCard: '[data-fs-product-card="true"]',
        name: 'h3',
        price: '.product-price_productSellingPrice__text__I1_vF',
        regularPrice: '.product-price_productListPrice__text__I1_vF',
        url: 'a[data-testid="product-link"]',
        image: 'img',
      },
    },
    vaquita: {
      domains: ['vaquitaexpress.com.co'],
      scrapeMethod: 'cheerio',
      name: 'LA VAQUITA',
      searchPath: '/catalogsearch/result/?q=',
      selectors: {
        productCard: '.product-item',
        name: '.product-item-link',
        price: '.price',
        regularPrice: '.old-price .price',
        url: '.product-item-link',
        image: '.product-image-photo',
      },
      transforms: { price: (text: string) => parseFloat(text.replace(/[^\d]/g, '')) },
    },
    mundohuevo: {
      domains: ['mundohuevo.com'],
      scrapeMethod: 'cheerio',
      name: 'MUNDO HUEVO',
      searchPath: '/search?q=',
      selectors: {
        productCard: '.col-12.nt_pr__',
        name: '.product-title a',
        price: '.price ins, .price:not(:has(ins))', // Prioriza 'ins' si existe (Shopify), de lo contrario el contenedor .price
        regularPrice: '.price del',
        url: '.product-title a',
        image: '.product-image img, .nt_pr img',
      },
    },
    supermu: {
      name: 'SUPER MU',
      searchPath: '/search?options[prefix]=last&q=',
      catalogPath: '/collections/all',
      domains: ['supermu.com'],
      scrapeMethod: 'cheerio',
      selectors: {
        productCard: '.product-collection',
        name: '.product-collection__title a, .product-title a, h4 a',
        price: '.price',
        regularPrice: '.price--sale span:first-child',
        url: '.product-collection__title a, .product-title a',
        brand: '.product-collection__brand, .brand',
        image: '.product-collection__image img, .rimage__img, [data-master]',
      },
    },

    farmatodo: { scrapeMethod: 'algolia', name: 'FARMATODO' },
    d1: { scrapeMethod: 'instaleap', domain: 'domicilios.tiendasd1.com', name: 'Tiendas D1' },
    makro: { scrapeMethod: 'instaleap', domain: 'tienda.makro.com.co', name: 'Makro' },
    rappi: { scrapeMethod: 'rappi', name: 'RAPPI' },
  };

  /**
   * Obtiene una instancia de la estrategia de búsqueda para una tienda específica.
   *
   * @param storeId - El ID de la tienda (ej: 'exito', 'rappi').
   * @param limit - Límite de resultados (opcional).
   * @returns Una instancia de ISearchStrategy o null si no existe.
   */
  static getStrategy(storeId: string, limit: number = 20): ISearchStrategy | null {
    const config = this.STORE_CONFIG[storeId];
    if (!config) return null;

    switch (config.scrapeMethod) {
      case 'vtex':
        return new VtexStrategy(config.vtexDomain, config.name, false, limit);
      case 'vtex-io':
        return new VtexStrategy(config.vtexDomain, config.name, true, limit);
      case 'cheerio':
        return new CheerioStrategy(config, config.name);
      case 'algolia':
        return new FarmatodoStrategy();
      case 'instaleap':
        return new InstaleapStrategy(config.domain, config.name);
      case 'rappi':
        return new RappiStrategy(config.name);
      default:
        return null;
    }
  }

  /**
   * Retorna la configuración de una tienda.
   */
  static getStoreConfig(storeId: string): any {
    return this.STORE_CONFIG[storeId];
  }

  /**
   * Retorna todos los IDs de tiendas disponibles.
   */
  static getAllStoreIds(): string[] {
    return Object.keys(this.STORE_CONFIG);
  }
}
