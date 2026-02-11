import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";

export class RappiStrategy implements ISearchStrategy {
    private storeName: string;

    constructor(storeName: string = "RAPPI") {
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
        const searchTerm = ean || query;
        // Rappi search URL for Colombia
        const url = `https://www.rappi.com.co/search?query=${encodeURIComponent(searchTerm)}`;

        try {
            console.log(`[RAPPI] Searching: ${url}`);

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
                console.error(`[RAPPI] Fetch failed: ${res.status}`);
                return [];
            }

            const html = await res.text();

            // Extract __NEXT_DATA__
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
            if (!nextDataMatch) {
                console.error("[RAPPI] __NEXT_DATA__ not found in HTML");
                return [];
            }

            const nextData = JSON.parse(nextDataMatch[1]);

            // Navigate to products efficiently
            let productsRaw: any[] = [];
            const fallback = nextData.props?.pageProps?.fallback || {};

            // Search in all fallback keys (they are dynamic SWR/React-Query keys)
            for (const key in fallback) {
                const data = fallback[key];
                if (data && data.stores && Array.isArray(data.stores)) {
                    data.stores.forEach((store: any) => {
                        if (store.products && Array.isArray(store.products)) {
                            productsRaw = productsRaw.concat(store.products);
                        }
                    });
                }
            }

            // Fallback to recursive search if fallback search didn't get enough
            if (productsRaw.length === 0) {
                const findProductsRecursive = (obj: any) => {
                    if (!obj || typeof obj !== 'object') return;
                    if (Array.isArray(obj)) {
                        const isProductList = obj.length > 0 && obj[0] &&
                            (obj[0].masterProductId !== undefined || (obj[0].name && obj[0].price));
                        if (isProductList) {
                            productsRaw = productsRaw.concat(obj);
                        } else {
                            obj.forEach(item => findProductsRecursive(item));
                        }
                    } else {
                        Object.values(obj).forEach(val => findProductsRecursive(val));
                    }
                };
                findProductsRecursive(nextData.props || {});
            }

            const results: ProductResult[] = [];
            const seenIds = new Set<string>();

            for (const p of productsRaw) {
                const id = p.masterProductId || p.productId || p.id;
                if (!p.name || !id || seenIds.has(String(id))) continue;
                seenIds.add(String(id));

                const { amount: grams, unit } = this.extractGrams(p.name);
                const price = p.price || 0;

                // Construct reliable URL
                // If slug is missing, /p/[masterProductId] works as a redirect
                const productUrl = p.slug
                    ? `https://www.rappi.com.co/p/${p.slug}-${p.masterProductId}`
                    : `https://www.rappi.com.co/p/${p.masterProductId || p.productId || p.id}`;

                results.push({
                    store: this.storeName,
                    productName: p.name,
                    price: price,
                    regularPrice: p.regularPrice || price,
                    discountPercentage: p.hasDiscount ? (p.discountPercentage || 0) : 0,
                    pricePerGram: grams > 0 ? price / grams : 0,
                    presentation: p.quantity ? `${p.quantity}${p.unitType || 'und'}` : `${grams}${unit}`,
                    gramsAmount: grams,
                    availability: (p.isAvailable || p.inStock) ? 'Disponible' : 'Agotado',
                    url: productUrl,
                    verifiedDate: new Date().toISOString().split('T')[0],
                    brand: p.brand || p.trademark || '',
                    // Mapping EAN: Since Rappi doesn't expose it in results, 
                    // we use the 'ean' parameter if the search was specifically for an EAN.
                    ean: p.ean || p.barcode || (ean ? ean : ''),
                    image: p.image || ''
                });

                if (results.length >= 20) break;
            }

            console.log(`[RAPPI] Found ${results.length} products.`);
            return results;

        } catch (e) {
            console.error(`[RAPPI] Error: ${e}`);
            return [];
        }
    }
}
