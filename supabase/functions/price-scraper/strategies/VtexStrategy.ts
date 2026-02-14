import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";
import { extractGrams, getStandardHeaders } from "../core/utils.ts";

/**
 * Estrategia de búsqueda para tiendas basadas en la plataforma VTEX.
 * 
 * Soporta tanto la API Legacy (Catalog System) como la nueva API de búsqueda
 * inteligente (Intelligent Search / VTEX IO). Incluye mecanismos de fallback
 * para evadir bloqueos de WAF y manejar diferentes configuraciones de tienda.
 */
export class VtexStrategy implements ISearchStrategy {
    private domain: string;
    private storeName: string;
    private isIO: boolean;
    private limit: number;

    /**
     * @param domain - Dominio de la tienda VTEX.
     * @param storeName - Nombre identificador de la tienda.
     * @param isIO - Indica si la tienda usa VTEX Intelligent Search (IO).
     * @param limit - Límite de productos a retornar.
     */
    constructor(domain: string, storeName: string, isIO: boolean = false, limit: number = 20) {
        this.domain = domain;
        this.storeName = storeName;
        this.isIO = isIO;
        this.limit = Math.min(Math.max(limit, 5), 50); // Clamp entre 5 y 50
    }

    /**
     * Ejecuta la búsqueda utilizando la API apropiada (IO o Legacy).
     * 
     * @param query - Término de búsqueda.
     * @param ean - EAN del producto.
     * @param timeout - Tiempo límite.
     */
    async search(query: string, ean?: string, timeout?: number): Promise<ProductResult[]> {
        let results: ProductResult[] = [];

        // Intento primario basado en la arquitectura de la tienda
        if (this.isIO) {
            results = await this.searchIO(query, timeout);
        } else {
            results = await this.searchLegacy(query, ean, timeout);
        }

        // Mecanismo de Fallback para Éxito/Carulla (tiendas IO)
        // Si IO retorna 0 (posible bloqueo o desincronización), intentamos Legacy.
        if (results.length === 0 && this.isIO) {
            console.log(`[VTEX] ${this.storeName} IO retornó 0. Reintentando con API Legacy...`);
            results = await this.searchLegacy(query, ean, timeout);
        }

        return results;
    }

    /**
     * Búsqueda mediante la API clásica de VTEX (/api/catalog_system).
     */
    private async searchLegacy(query: string, ean?: string, timeout?: number): Promise<ProductResult[]> {
        try {
            const isEan = !!ean || /^\d{8,14}$/.test(query);
            const isExitoGroup = this.domain.includes('exito.com');
            const basePath = isExitoGroup ? '/io/api/catalog_system/pub/products/search' : '/api/catalog_system/pub/products/search';

            const searchUrl = isEan
                ? `https://${this.domain}${basePath}?fq=alternateIds_Ean:${encodeURIComponent(ean || query)}`
                : `https://${this.domain}${basePath}?ft=${encodeURIComponent(query)}&_from=0&_to=${this.limit - 1}`;

            console.log(`[VTEX] ${this.storeName} consultando Legacy: ${searchUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout || 15000);

            let data = null;

            try {
                const res = await fetch(searchUrl, {
                    signal: controller.signal,
                    redirect: 'follow',
                    headers: getStandardHeaders(this.domain, true)
                });

                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    console.warn(`[VTEX] ${this.storeName} retornó HTML (posible bloqueo WAF).`);
                } else {
                    data = await res.json();
                }
            } catch (err) {
                console.warn(`[VTEX] Error en búsqueda inicial: ${err}.`);
            } finally {
                clearTimeout(timeoutId);
            }

            // Fallback secundario: Búsqueda basada en ruta para VTEX antiguos
            if ((!data || (Array.isArray(data) && data.length === 0)) && !isEan) {
                const altUrl = `https://${this.domain}${basePath}/${encodeURIComponent(query)}`;
                const controller2 = new AbortController();
                setTimeout(() => controller2.abort(), timeout || 15000);
                try {
                    const res2 = await fetch(altUrl, {
                        signal: controller2.signal,
                        headers: getStandardHeaders(this.domain, true)
                    });
                    if (res2.ok) data = await res2.json();
                } catch (_e) { /* ignore */ }
            }

            if (!Array.isArray(data)) return [];

            return data.map((p: any) => {
                try {
                    const cleanTargetEan = (ean || query || "").replace(/\D/g, "");
                    // Buscar el SKU con EAN coincidente o el primero disponible
                    let item = p.items?.find((i: any) =>
                        (i.ean?.replace(/\D/g, "") === cleanTargetEan) &&
                        (i.sellers?.[0]?.commertialOffer?.AvailableQuantity || 0) > 0
                    );

                    if (!item && cleanTargetEan.length > 5) {
                        item = p.items?.find((i: any) => i.ean?.replace(/\D/g, "") === cleanTargetEan);
                    }

                    if (!item && !isEan) {
                        item = p.items?.find((i: any) => (i.sellers?.[0]?.commertialOffer?.AvailableQuantity || 0) > 0);
                    }

                    if (!item) item = p.items?.[0];
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
                        image: item.images?.[0]?.imageUrl || '',
                        sourceUrl: searchUrl
                    };
                } catch (_e) {
                    return null;
                }
            }).filter((p: any) => p !== null) as ProductResult[];

        } catch (e) {
            console.error(`[VTEX] Error en searchLegacy para ${this.storeName}:`, e);
            return [];
        }
    }

    /**
     * Pre-calienta la sesión obteniendo cookies iniciales para VTEX IO.
     */
    private async getCookies(): Promise<string> {
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`https://${this.domain}/`, {
                method: 'HEAD',
                signal: controller.signal,
                headers: getStandardHeaders(this.domain, false)
            });

            const setCookie = res.headers.get('set-cookie');
            if (setCookie) {
                return setCookie.split(',')
                    .map(c => c.split(';')[0].trim())
                    .join('; ');
            }
        } catch (_e) { /* ignore */ }
        return '';
    }

    /**
     * Búsqueda mediante Intelligent Search de VTEX IO.
     */
    private async searchIO(query: string, timeout?: number): Promise<ProductResult[]> {
        try {
            const cookies = await this.getCookies();
            const searchUrl = `https://${this.domain}/api/io/_v/api/intelligent-search/product_search/?query=${encodeURIComponent(query)}&count=${this.limit}&page=1`;

            console.log(`[VTEX-IO] ${this.storeName} consultando: ${searchUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout || 15000);

            try {
                const res = await fetch(searchUrl, {
                    signal: controller.signal,
                    headers: {
                        ...getStandardHeaders(this.domain, true),
                        ...(cookies ? { 'Cookie': cookies } : {})
                    }
                });

                clearTimeout(timeoutId);

                if (!res.ok) {
                    const errorText = await res.text().catch(() => "Sin cuerpo");
                    console.warn(`[VTEX-IO] ${this.storeName} falló con estado ${res.status}. ${errorText.substring(0, 100)}`);
                    return [];
                }

                const data = await res.json();
                const items = data.products || [];

                return items.map((p: any) => {
                    try {
                        const item = p.items?.[0];
                        if (!item) return null;

                        const offer = item?.sellers?.[0]?.commertialOffer;
                        if (!offer) return null;

                        const price = offer.Price || offer.PriceWithTax || 0;
                        const regularPrice = offer.ListPrice || price;
                        const discountPercentage = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

                        const productName = p.productName || item.nameComplete || item.name || '';
                        const { amount: grams, unit } = extractGrams(productName);
                        const isAvailable = (offer.AvailableQuantity || 0) > 0;

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
                            image: item.images?.[0]?.imageUrl || '',
                            sourceUrl: searchUrl
                        };
                    } catch (_e) {
                        return null;
                    }
                }).filter((p: any) => p !== null) as ProductResult[];
            } catch (err: any) {
                clearTimeout(timeoutId);
                console.error(`[VTEX-IO] Error en fetch para ${this.storeName}:`, err.message);
                return [];
            }
        } catch (e) {
            console.error(`[VTEX-IO] Error crítico en searchIO para ${this.storeName}:`, e);
            return [];
        }
    }
}

