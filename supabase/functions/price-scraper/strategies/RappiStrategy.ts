import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";
import { extractGrams, getStandardHeaders } from "../core/utils.ts";

/**
 * Estrategia de búsqueda para Rappi.
 * 
 * Dado que Rappi es una aplicación de Single Page (SPA) compleja, esta estrategia
 * extrae los datos del bloque __NEXT_DATA__ inyectado en el HTML inicial.
 * Esto permite obtener información precisa de múltiples tiendas y productos
 * con una sola petición.
 */
export class RappiStrategy implements ISearchStrategy {
    private storeName: string;

    /**
     * @param storeName - Nombre base para identificar los resultados (default: RAPPI).
     */
    constructor(storeName: string = "RAPPI") {
        this.storeName = storeName;
    }

    /**
     * Realiza la búsqueda de productos en Rappi.
     * 
     * @param query - Término de búsqueda.
     * @param ean - (Opcional) EAN para búsqueda directa.
     * @param _timeout - Tiempo máximo de espera.
     * @returns Lista de productos normalizados, incluyendo el nombre del aliado (merchant).
     */
    async search(query: string, ean?: string, _timeout?: number): Promise<ProductResult[]> {
        const searchTerm = ean || query;
        const domain = 'www.rappi.com.co';
        const url = `https://${domain}/search?query=${encodeURIComponent(searchTerm)}`;

        try {
            console.log(`[RAPPI] Buscando: ${url}`);

            const headers: Record<string, string> = getStandardHeaders(domain, false);

            // Ubicación técnica por defecto (Bogotá) para asegurar resultados en Rappi
            const currentLocation = {
                address: "Bogotá, Colombia",
                lat: 4.6097,
                lng: -74.0817,
                city: "Bogotá",
                country: "Colombia",
                active: true
            };
            headers['Cookie'] = `currentLocation=${encodeURIComponent(JSON.stringify(currentLocation))}`;
            console.log(`[RAPPI] Usando ubicación técnica: Bogotá (Nacional)`);

            const res = await fetch(url, { headers });

            if (!res.ok) {
                console.error(`[RAPPI] Error en fetch: ${res.status}`);
                return [];
            }

            const html = await res.text();

            // Extraer el objeto JSON de estado inicial de Next.js
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
            if (!nextDataMatch) {
                console.error("[RAPPI] No se encontró __NEXT_DATA__ en el HTML");
                return [];
            }

            const nextData = JSON.parse(nextDataMatch[1]);

            let productsRaw: any[] = [];
            const fallback = nextData.props?.pageProps?.fallback || {};

            // Navegar por las claves dinámicas de SWR para encontrar los datos de productos
            for (const key in fallback) {
                const data = fallback[key];
                if (data && data.stores && Array.isArray(data.stores)) {
                    data.stores.forEach((store: any) => {
                        const merchantName = store.storeName || store.name || 'General';
                        if (store.products && Array.isArray(store.products)) {
                            store.products.forEach((p: any) => {
                                p.merchantName = merchantName; // Inyectamos nombre de la tienda aliada
                                productsRaw.push(p);
                            });
                        }
                    });
                }
            }

            // Fallback recursivo si la ruta estándar falló
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
                // La llave única incluye el merchant para permitir el mismo producto en tiendas distintas
                const uniqueKey = `${p.merchantName || ''}_${id}`;
                if (!p.name || !id || seenIds.has(uniqueKey)) continue;
                seenIds.add(uniqueKey);

                const { amount: grams, unit } = extractGrams(p.name);
                const price = p.price || 0;
                const regularPrice = p.realPrice || price;

                let discountPercentage = 0;
                if (p.hasDiscount && p.discount) {
                    if (typeof p.discount.value === 'number') {
                        discountPercentage = Math.round(p.discount.value * 100);
                    } else if (p.discount.text) {
                        const pctMatch = p.discount.text.match(/(\d+)%/);
                        if (pctMatch) discountPercentage = parseInt(pctMatch[1]);
                    }
                }

                const productUrl = p.slug
                    ? `https://${domain}/p/${p.slug}-${p.masterProductId}`
                    : `https://${domain}/p/${p.masterProductId || p.productId || p.id}`;

                results.push({
                    store: p.merchantName ? `RAPPI - ${p.merchantName}` : this.storeName,
                    productName: p.name,
                    price: price,
                    regularPrice: regularPrice,
                    discountPercentage: discountPercentage,
                    pricePerGram: grams > 0 ? price / grams : 0,
                    presentation: p.quantity ? `${p.quantity}${p.unitType || 'und'}` : `${grams}${unit}`,
                    gramsAmount: grams,
                    availability: (p.isAvailable || p.inStock) ? 'Disponible' : 'Agotado',
                    url: productUrl,
                    verifiedDate: new Date().toISOString().split('T')[0],
                    brand: p.brand || p.trademark || '',
                    ean: p.ean || p.barcode || (ean ? ean : ''),
                    image: p.image || '',
                    sourceUrl: url
                });

                if (results.length >= 30) break;
            }

            console.log(`[RAPPI] Encontrados ${results.length} productos.`);
            return results;

        } catch (e) {
            console.error(`[RAPPI] Error: ${e}`);
            return [];
        }
    }
}

