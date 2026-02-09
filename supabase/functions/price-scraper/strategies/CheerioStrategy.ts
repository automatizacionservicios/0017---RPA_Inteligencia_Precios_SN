import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";
import { extractGrams, getStandardHeaders } from "../core/utils.ts";
import cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

export class CheerioStrategy implements ISearchStrategy {
    private config: any;
    private storeName: string;

    constructor(config: any, storeName: string) {
        this.config = config;
        this.storeName = storeName;
    }



    private extractGrams(text: string): { amount: number, unit: string } {
        if (!text) return { amount: 250, unit: 'g' };
        const match = text.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|kg|ml|lt?|litros?|lb|libra|und|unidades)/i);
        if (!match) {
            const lMatch = text.match(/(\d+)\s*L(itro)?\b/i);
            if (lMatch) return { amount: parseFloat(lMatch[1]) * 1000, unit: 'ml' };
            return { amount: 250, unit: 'g' };
        }
        let val = parseFloat(match[1].replace(',', '.'));
        const unitStr = match[2].toLowerCase();
        if (unitStr.startsWith('kg') || unitStr === 'l' || unitStr.startsWith('litro')) {
            if (unitStr !== 'lb' && unitStr !== 'libra') {
                return { amount: val * 1000, unit: (unitStr.startsWith('l') || unitStr.includes('lt')) ? 'ml' : 'g' };
            }
        }
        if (unitStr.startsWith('lb')) return { amount: val * 500, unit: 'g' };
        const finalUnit = (unitStr.startsWith('m') || unitStr.startsWith('l')) ? 'ml' : (unitStr.startsWith('u') ? 'und' : 'g');
        if (finalUnit === 'und') return { amount: val, unit: 'und' };
        return { amount: val, unit: finalUnit };
    }

    async search(query: string, ean?: string, timeout?: number): Promise<ProductResult[]> {
        try {
            const isEan = /^\d{8,14}$/.test(query);
            const searchBase = this.config.searchPath || '/?s=';
            const safeQuery = query || 'carnes';
            const cleanQuery = safeQuery.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
            const url = `https://${this.config.domains[0]}${searchBase}${encodeURIComponent(cleanQuery)}`;

            console.log(`[CHEERIO] ${this.storeName} scraping: ${url}`);

            const controller = new AbortController();
            const fetchTimeout = setTimeout(() => controller.abort(), timeout || 10000);
            let res;
            try {
                res = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                        'Accept-Encoding': 'identity',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Referer': 'https://www.google.com/',
                        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Ch-Ua-Platform': '"Windows"',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'cross-site',
                        'Sec-Fetch-User': '?1',
                        'Upgrade-Insecure-Requests': '1'
                    }
                });
            } finally {
                clearTimeout(fetchTimeout);
            }

            if (!res.ok) return [];

            const blob = await res.blob();
            if (blob.size > 4 * 1024 * 1024) return [];

            const html = await blob.text();
            const $ = cheerio.load(html);
            let products: ProductResult[] = [];

            const cards = $(this.config.selectors.productCard);

            cards.slice(0, 15).each((i: number, el: any) => {
                try {
                    const name = $(el).find(this.config.selectors.name).first().text().trim();
                    const priceText = $(el).find(this.config.selectors.price).first().text().trim();
                    const regularPriceText = this.config.selectors.regularPrice ? $(el).find(this.config.selectors.regularPrice).first().text().trim() : null;

                    if (!name || !priceText) return;

                    const price = this.config.transforms?.price ? this.config.transforms.price(priceText) : parseFloat(priceText.replace(/[^\d]/g, ''));
                    const regularPrice = regularPriceText ? (this.config.transforms?.price ? this.config.transforms.price(regularPriceText) : parseFloat(regularPriceText.replace(/[^\d]/g, ''))) : price;
                    const discountPercentage = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

                    if (!price || price < 50) return;

                    const { amount: grams, unit } = this.extractGrams(name);
                    let link = $(el).find(this.config.selectors.url || 'a').attr('href') || '';
                    if (link && !link.startsWith('http')) {
                        try {
                            link = new URL(link, url).href;
                        } catch (e) {
                            link = `https://${this.config.domains[0]}${link.startsWith('/') ? '' : '/'}${link}`;
                        }
                    }

                    let brand = '';
                    if (this.config.selectors.brand) {
                        brand = $(el).find(this.config.selectors.brand).text().trim();
                    }

                    // Extract image
                    let image = '';
                    if (this.config.selectors.image) {
                        const imgEl = $(el).find(this.config.selectors.image).first();
                        image = imgEl.attr('data-master') ||
                            imgEl.attr('data-original') ||
                            imgEl.attr('data-srcset')?.split(' ')[0] ||
                            imgEl.attr('src') ||
                            imgEl.attr('data-src') || '';

                        // Clean data-master {width} placeholder
                        if (image.includes('{width}')) {
                            image = image.replace('{width}', '600');
                        }
                    } else {
                        // Heuristic for Shopify/General images
                        const firstImg = $(el).find('img').first();
                        image = firstImg.attr('data-master') ||
                            firstImg.attr('data-original') ||
                            firstImg.attr('data-srcset')?.split(' ')[0] ||
                            firstImg.attr('src') ||
                            firstImg.attr('data-src') || '';

                        if (image.includes('{width}')) {
                            image = image.replace('{width}', '600');
                        }
                    }

                    if (image && !image.startsWith('http')) {
                        image = `https:${image.startsWith('//') ? '' : '//'}${image.replace(/^\/\//, '')}`;
                    }

                    if (priceText === "00" || priceText === "0" || price <= 1) return;

                    // --- INTELLIGENT EAN EXTRACTION ---
                    // Strategy: 
                    // 1. If searching by EAN (Pareto use case), assign it to all products
                    // 2. Otherwise, try to extract EAN from product URL
                    // 3. Fallback to empty if not found
                    let productEan = '';

                    if (ean && /^\d{8,14}$/.test(ean)) {
                        // Case 1: EAN search (Pareto bulk load)
                        productEan = ean;
                    } else if (link) {
                        // Case 2: Extract from URL
                        // Match 8, 12, or 13 digit sequences (common EAN formats)
                        const eanMatch = link.match(/\b(\d{13}|\d{12}|\d{8})\b/);
                        if (eanMatch) {
                            productEan = eanMatch[1];
                        }
                    }

                    products.push({
                        store: this.storeName,
                        productName: name,
                        price,
                        regularPrice,
                        discountPercentage,
                        pricePerGram: price / (grams || 1),
                        presentation: `${grams}${unit}`,
                        gramsAmount: grams,
                        availability: 'Disponible',
                        url: link,
                        verifiedDate: new Date().toISOString().split('T')[0],
                        brand: brand || '',
                        ean: productEan, // ✅ Now intelligently extracted
                        image
                    });
                } catch (e) { }
            });

            return products;
        } catch (e) {
            console.error(`[CHEERIO] Error: ${e}`);
            return [];
        }
    }
}
