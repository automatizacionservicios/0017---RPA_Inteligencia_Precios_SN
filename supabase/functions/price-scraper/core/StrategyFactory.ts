import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { FarmatodoStrategy } from "../strategies/FarmatodoStrategy.ts";
import { VtexStrategy } from "../strategies/VtexStrategy.ts";
import { CheerioStrategy } from "../strategies/CheerioStrategy.ts";
import { InstaleapStrategy } from "../strategies/InstaleapStrategy.ts";
import { RappiStrategy } from "../strategies/RappiStrategy.ts";
import { Store } from "../interfaces/IProduct.ts";

export class StrategyFactory {
    // We'll keep the config here to spawn strategies

    // Config from original index.ts
    private static STORE_CONFIG: Record<string, any> = {
        carulla: {
            domains: ['carulla.com'],
            vtexDomain: 'www.carulla.com',
            scrapeMethod: 'vtex',
            name: 'CARULLA',
            // Cheerio fallback config for when VTEX API is blocked
            searchPath: '/search/?_query=',
            selectors: {
                productCard: '.vtex-search-result-3-x-galleryItem, .vtex-product-summary-2-x-container',
                name: '.vtex-product-summary-2-x-productBrand',
                price: '.vtex-product-price-1-x-sellingPrice',
                regularPrice: '.vtex-product-price-1-x-listPrice',
                url: 'a.vtex-product-summary-2-x-clearLink',
                image: '.vtex-product-summary-2-x-imageNormal'
            }
        },
        exito: { domains: ['www.exito.com'], vtexDomain: 'www.exito.com', scrapeMethod: 'vtex', name: 'ÉXITO' },
        jumbo: { domains: ['www.jumbocolombia.com'], vtexDomain: 'www.jumbocolombia.com', scrapeMethod: 'vtex', name: 'JUMBO' },
        olimpica: { domains: ['www.olimpica.com'], vtexDomain: 'www.olimpica.com', scrapeMethod: 'vtex', name: 'OLÍMPICA' },
        euro: { domains: ['www.eurosupermercados.com.co'], vtexDomain: 'www.eurosupermercados.com.co', scrapeMethod: 'vtex', name: 'EURO SUPERMERCADOS' },
        megatiendas: { domains: ['www.megatiendas.co'], vtexDomain: 'www.megatiendas.co', scrapeMethod: 'vtex', name: 'MEGATIENDAS' },
        mercacentro: { domains: ['www.mercacentro.com'], vtexDomain: 'www.mercacentro.com', scrapeMethod: 'vtex', name: 'MERCACENTRO' },
        nutresa: { domains: ['www.tiendanutresaencasa.com'], vtexDomain: 'www.tiendanutresaencasa.com', scrapeMethod: 'vtex-io', name: 'NUTRESA EN CASA' },
        zapatoca: {
            domains: ['www.mercadozapatoca.com'],
            scrapeMethod: 'cheerio',
            name: 'ZAPATOCA',
            searchPath: '/search/?k=',
            selectors: {
                productCard: '#categorias .dpr_container',
                name: '.dpr_product-name',
                price: '.dpr_listprice',
                regularPrice: '.dpr_oldprice', // Assuming common VTEX/Cheerio pattern
                url: 'a.dpr_listname',
                image: '.dpr_imagen_thumb img'
            }
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
                regularPrice: '.old-price .price', // Magento pattern
                url: '.product-item-link',
                image: '.product-image-photo'
            },
            transforms: { price: (text: string) => parseFloat(text.replace(/[^\d]/g, '')) }
        },
        mundohuevo: {
            domains: ['mundohuevo.com'],
            scrapeMethod: 'cheerio',
            name: 'MUNDO HUEVO',
            searchPath: '/search?q=',
            selectors: {
                productCard: '.col-12.nt_pr__',
                name: '.product-title a',
                price: '.price', // Main price class (inclusive of ins/standard)
                regularPrice: 'del .price', // Strikethrough price
                url: '.product-title a',
                image: '.product-image img, .nt_pr img'
            }
        },
        farmatodo: {
            scrapeMethod: 'algolia',
            name: 'FARMATODO'
        },
        // Deep Links
        // Instaleap / Moira Engine
        d1: { scrapeMethod: 'instaleap', domain: 'domicilios.tiendasd1.com', name: 'Tiendas D1' },
        makro: { scrapeMethod: 'instaleap', domain: 'tienda.makro.com.co', name: 'Makro' },
        mercaldas: {
            domains: ['www.mercaldas.com'],
            vtexDomain: 'www.mercaldas.com',
            scrapeMethod: 'vtex',
            name: 'MERCALDAS'
        },
        'supermu': {
            name: 'SUPER MU',
            searchPath: '/search?options[prefix]=last&q=',
            catalogPath: '/collections/all',
            domains: ['supermu.com'],
            scrapeMethod: 'cheerio',
            selectors: {
                productCard: '.product-collection',
                name: '.product-collection__title a',
                price: '[data-js-product-price] span',
                regularPrice: '.product-collection__price .price--old span',
                url: '.product-collection__title a',
                image: '[data-master]'
            }
        },
        rappi: {
            scrapeMethod: 'rappi',
            name: 'RAPPI'
        }
    };

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

    static getStoreConfig(storeId: string): any {
        return this.STORE_CONFIG[storeId];
    }

    static getAllStoreIds(): string[] {
        return Object.keys(this.STORE_CONFIG);
    }
}
