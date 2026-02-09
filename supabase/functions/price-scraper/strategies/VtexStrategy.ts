import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";
import { extractGrams, getStandardHeaders } from "../core/utils.ts";

export class VtexStrategy implements ISearchStrategy {
    private domain: string;
    private storeName: string;
    private isIO: boolean;
    private limit: number;

    constructor(domain: string, storeName: string, isIO: boolean = false, limit: number = 20) {
        this.domain = domain;
        this.storeName = storeName;
        this.isIO = isIO;
        this.limit = Math.min(Math.max(limit, 5), 50); // Clamp between 5 and 50
    }



    async search(query: string, ean?: string, timeout?: number): Promise<ProductResult[]> {
        let results: ProductResult[] = [];

        // Primary attempt
        if (this.isIO) {
            results = await this.searchIO(query, timeout);
        } else {
            results = await this.searchLegacy(query, ean, timeout);
        }

        // Fallback Mechanism for Exito/Carulla (IO stores)
        // If IO returns 0 results, try Legacy endpoint which sometimes has different WAF rules
        if (results.length === 0 && this.isIO) {
            console.log(`[VTEX] ${this.storeName} IO search returned 0. Retrying with Legacy API...`);
            results = await this.searchLegacy(query, ean, timeout); // Try legacy endpoint
        }

        return results;
    }



    private async searchLegacy(query: string, ean?: string, timeout?: number): Promise<ProductResult[]> {
        try {
            const isEan = !!ean || /^\d{8,14}$/.test(query);
            const isExitoGroup = this.domain.includes('exito.com'); // Only Éxito is VTEX IO, Carulla is Legacy
            const basePath = isExitoGroup ? '/io/api/catalog_system/pub/products/search' : '/api/catalog_system/pub/products/search';

            const searchUrl = isEan
                ? `https://${this.domain}${basePath}?fq=alternateIds_Ean:${ean || query}`
                : `https://${this.domain}${basePath}?ft=${encodeURIComponent(query)}&_from=0&_to=${this.limit - 1}`; // Standard FT search

            console.log(`[VTEX] ${this.storeName} fetching: ${searchUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout || 15000);

            let res = null;
            let data = null;

            try {
                res = await fetch(searchUrl, {
                    signal: controller.signal,
                    redirect: 'follow',
                    headers: getStandardHeaders(this.domain, true)
                });

                // Check Content-Type before parsing as JSON
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    console.warn(`[VTEX] ${this.storeName} returned HTML instead of JSON (likely WAF block). Content-Type: ${contentType}`);
                    const htmlSnippet = await res.text();
                    console.log(`[VTEX] ${this.storeName} HTML snippet: ${htmlSnippet.substring(0, 200)}`);
                    // Don't try to parse as JSON, let it fall through to fallback
                } else {
                    data = await res.json();
                }
            } catch (err) {
                // Ignore initial error to try fallback
                console.warn(`[VTEX] Initial search failed: ${err}.`);
            } finally {
                clearTimeout(timeoutId);
            }

            // Fallback: Path-based search (common in older VTEX like Mercaldas)
            // If primary search failed or returned 0 results
            if ((!data || (Array.isArray(data) && data.length === 0)) && !isEan) {
                console.log(`[VTEX] ${this.storeName} standard search empty/failed. Retrying with Path-Based search...`);
                const pathUrl = `https://${this.domain}${basePath}/${encodeURIComponent(query)}/p`; // Try /search/query/p or just /search/query
                // Actually standard legacy is /products/search/term
                const altUrl = `https://${this.domain}${basePath}/${encodeURIComponent(query)}`;

                const controller2 = new AbortController();
                setTimeout(() => controller2.abort(), timeout || 15000);
                try {
                    const res2 = await fetch(altUrl, {
                        signal: controller2.signal,
                        redirect: 'follow',
                        headers: getStandardHeaders(this.domain, true)
                    });
                    if (res2.ok) {
                        data = await res2.json();
                    }
                } catch (e) { console.error(`[VTEX] Fallback failed: ${e}`); }
            }

            console.log(`[VTEX] ${this.storeName} received ${Array.isArray(data) ? data.length : 0} products from API`);
            if (!Array.isArray(data)) return [];

            const finalProducts = data.map((p: any) => {
                try {
                    const cleanTargetEan = (ean || query || "").replace(/\D/g, "");
                    let item = p.items?.find((i: any) =>
                        (i.ean?.replace(/\D/g, "") === cleanTargetEan) &&
                        (i.sellers?.[0]?.commertialOffer?.AvailableQuantity || 0) > 0
                    );

                    if (!item && cleanTargetEan.length > 5) {
                        item = p.items?.find((i: any) => i.ean?.replace(/\D/g, "") === cleanTargetEan);
                    }

                    if ((ean || (query && /^\d+$/.test(query))) && !item) {
                        return null;
                    }

                    if (!item && !isEan) {
                        item = p.items?.find((i: any) => (i.sellers?.[0]?.commertialOffer?.AvailableQuantity || 0) > 0);
                    }

                    if (!item && !isEan) item = p.items?.[0];
                    if (!item) return null;

                    const offer = item?.sellers?.[0]?.commertialOffer;
                    if (!offer) return null;

                    const price = offer.Price || 0;
                    const regularPrice = offer.ListPrice || price;
                    const discountPercentage = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

                    const productName = item.nameComplete || item.name || p.productName;
                    const { amount: grams, unit } = extractGrams(productName);
                    const isAvailable = (offer.AvailableQuantity || 0) > 0;

                    if (!isEan && query !== '' && price < 50) return null;

                    const imageUrl = item.images?.[0]?.imageUrl || p.items?.[0]?.images?.[0]?.imageUrl || '';

                    return {
                        store: this.storeName,
                        productName: isAvailable ? productName : `[AGOTADO] ${productName}`,
                        price,
                        regularPrice,
                        discountPercentage,
                        pricePerGram: price / (grams || 1),
                        presentation: `${grams}${unit}`,
                        gramsAmount: grams,
                        availability: isAvailable ? 'Disponible' : 'Agotado',
                        url: `https://${this.domain}/${p.linkText}/p`,
                        verifiedDate: new Date().toISOString().split('T')[0],
                        brand: p.brand || '',
                        ean: item?.ean,
                        image: imageUrl
                    };
                } catch (e) {
                    return null;
                }
            }).filter((p: any) => p !== null) as ProductResult[];

            console.log(`[VTEX] ${this.storeName} final count: ${finalProducts.length} products`);
            return finalProducts;

        } catch (e: any) {
            clearTimeout(timeoutId);
            console.error(`[VTEX] Error in searchLegacy for ${this.storeName}:`, e);
            return [];
        }
    }

    private async searchIO(query: string, timeout?: number): Promise<ProductResult[]> {
        try {
            const searchUrl = `https://${this.domain}/api/io/_v/api/intelligent-search/product_search/?query=${encodeURIComponent(query)}&count=${this.limit}&page=1`;
            console.log(`[VTEX-IO] ${this.storeName} fetching: ${searchUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout || 15000);

            try {
                const res = await fetch(searchUrl, {
                    signal: controller.signal,
                    redirect: 'follow',
                    headers: getStandardHeaders(this.domain, true)
                });

                clearTimeout(timeoutId);
                console.log(`[VTEX-IO] ${this.storeName} response status: ${res.status}`);

                if (!res.ok) {
                    const errorText = await res.text().catch(() => "No body");
                    console.error(`[VTEX-IO] ${this.storeName} fetch failed with status ${res.status}. Body: ${errorText.substring(0, 200)}`);
                    return [];
                }

                const data = await res.json();
                const items = data.products || [];

                const finalProducts = items.map((p: any) => {
                    try {
                        const item = p.items?.[0];
                        if (!item) return null;

                        const offer = item?.sellers?.[0]?.commertialOffer;
                        if (!offer) return null;

                        let price = offer.Price || 0;
                        if (offer.PriceWithTax) {
                            price = offer.PriceWithTax;
                        } else if (offer.Tax) {
                            price += offer.Tax;
                        }

                        const productName = p.productName || item.nameComplete || item.name || '';
                        const { amount: grams, unit } = extractGrams(productName);
                        const isAvailable = (offer.AvailableQuantity || 0) > 0;

                        const regularPrice = offer.ListPrice || price;
                        const discountPercentage = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

                        const imageUrl = item.images?.[0]?.imageUrl || p.items?.[0]?.images?.[0]?.imageUrl || '';

                        return {
                            store: this.storeName,
                            productName: isAvailable ? productName : `[AGOTADO] ${productName}`,
                            price,
                            regularPrice,
                            discountPercentage,
                            pricePerGram: price / (grams || 1),
                            presentation: `${grams}${unit}`,
                            gramsAmount: grams,
                            availability: isAvailable ? 'Disponible' : 'Agotado',
                            url: `https://${this.domain}/${p.linkText}/p`,
                            verifiedDate: new Date().toISOString().split('T')[0],
                            brand: p.brand || '',
                            ean: item.ean,
                            image: imageUrl
                        };
                    } catch (e) {
                        return null;
                    }
                }).filter((p: any) => p !== null) as ProductResult[];

                console.log(`[VTEX-IO] ${this.storeName} final count: ${finalProducts.length} products`);
                return finalProducts;
            } catch (err: any) {
                clearTimeout(timeoutId);
                console.error(`[VTEX-IO] Fetch error for ${this.storeName}:`, err.name === 'AbortError' ? 'Timeout' : err.message);
                return [];
            }
        } catch (e) {
            console.error(`[VTEX-IO] Critical error in searchIO for ${this.storeName}:`, e);
            return [];
        }
    }
}
