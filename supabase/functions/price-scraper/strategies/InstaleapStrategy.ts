import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";

export class InstaleapStrategy implements ISearchStrategy {
    private storeName: string;
    private domain: string;

    constructor(domain: string, storeName: string) {
        this.domain = domain;
        this.storeName = storeName;
    }

    private extractGrams(text: string): { amount: number, unit: string } {
        if (!text) return { amount: 1, unit: 'Und' };
        const match = text.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|kg|ml|lt?|litros?|lb|libra|und|unidades)/i);
        if (!match) return { amount: 1, unit: 'Und' };

        let val = parseFloat(match[1].replace(',', '.'));
        const unitStr = match[2].toLowerCase();

        if (unitStr.startsWith('kg') || unitStr === 'l' || unitStr.startsWith('litro')) {
            return { amount: val * 1000, unit: (unitStr.startsWith('l')) ? 'ml' : 'g' };
        }
        if (unitStr.startsWith('lb')) return { amount: val * 500, unit: 'g' };

        const finalUnit = (unitStr.startsWith('m') || unitStr.startsWith('l')) ? 'ml' : (unitStr.startsWith('u') ? 'und' : 'g');
        return { amount: val, unit: finalUnit };
    }

    async search(query: string, ean?: string): Promise<ProductResult[]> {
        const url = `https://${this.domain}/search?name=${encodeURIComponent(ean || query)}`;

        try {
            console.log(`[INSTALEAP] ${this.storeName} searching: ${url}`);

            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!res.ok) {
                console.error(`[INSTALEAP] ${this.storeName} fetch failed: ${res.status}`);
                return [];
            }

            const html = await res.text();

            // Regex to find product blobs in Next.js Flight format
            // format: \"product\":{\"name\":\"...\",\"price\":...}
            // We use a non-greedy match for the name and find the price following it
            const productRegex = /\\"product\\":\{[^}]*?\\"name\\":\\"(.*?)\\",\\"price\\":(\d+).*?\\"sku\\":\\"(.*?)\\"/g;

            const results: ProductResult[] = [];
            let match;

            while ((match = productRegex.exec(html)) !== null) {
                const name = match[1].replace(/\\u[0-9a-fA-F]{4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));
                const price = parseInt(match[2]);
                const sku = match[3];

                // Extra fields search within the context of the match if possible, or just look nearby
                // For simplicity, we'll search for EAN and Photos near the match index
                const context = html.substring(match.index, match.index + 2000);

                const eanMatch = context.match(/\\"ean\\":\[\\"(.*?)\\"/);
                const photoMatch = context.match(/\\"photosUrl\\":\[\\"(.*?)\\"/);
                const slugMatch = context.match(/\\"slug\\":\\"(.*?)\\"/);
                const brandMatch = context.match(/\\"brand\\":\\"(.*?)\\"/);
                const stockMatch = context.match(/\\"stock\\":(\d+)/);
                const fullPriceMatch = context.match(/\\"fullPrice\\":(\d+)/);

                const productEan = eanMatch ? eanMatch[1] : '';
                const mainImage = photoMatch ? photoMatch[1].replace(/\\/g, '') : '';
                const productSlug = slugMatch ? slugMatch[1] : '';
                const brand = brandMatch ? brandMatch[1] : '';
                const availability = (stockMatch && parseInt(stockMatch[1]) > 0) ? 'Disponible' : 'Agotado';
                const regularPrice = fullPriceMatch ? parseInt(fullPriceMatch[1]) : price;
                const discountPercentage = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

                const { amount: grams, unit } = this.extractGrams(name);

                results.push({
                    store: this.storeName,
                    productName: name,
                    price: price,
                    regularPrice,
                    discountPercentage,
                    pricePerGram: price / (grams || 1),
                    presentation: `${grams}${unit}`,
                    gramsAmount: grams,
                    availability: availability,
                    url: `https://${this.domain}/p/${productSlug || sku}`,
                    verifiedDate: new Date().toISOString().split('T')[0],
                    brand: brand,
                    ean: productEan,
                    image: mainImage
                });

                if (results.length >= 15) break;
            }

            console.log(`[INSTALEAP] ${this.storeName} found ${results.length} products.`);
            return results;

        } catch (e) {
            console.error(`[INSTALEAP] ${this.storeName} error: ${e}`);
            return [];
        }
    }
}
