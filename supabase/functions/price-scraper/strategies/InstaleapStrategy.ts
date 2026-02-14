import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";
import { extractGrams, getStandardHeaders } from "../core/utils.ts";

/**
 * Estrategia de búsqueda para tiendas basadas en la plataforma Instaleap.
 * 
 * Utiliza una técnica de "scraping híbrido" extrayendo datos de los bloques
 * __NEXT_DATA__ o Flight de Next.js para obtener información estructurada
 * sin necesidad de una API oficial abierta.
 */
export class InstaleapStrategy implements ISearchStrategy {
    private storeName: string;
    private domain: string;

    /**
     * @param domain - Dominio de la tienda (ej: tienda.com).
     * @param storeName - Nombre identificador de la tienda.
     */
    constructor(domain: string, storeName: string) {
        this.domain = domain;
        this.storeName = storeName;
    }

    /**
     * Realiza la búsqueda de productos en la plataforma Instaleap.
     * 
     * @param query - Término de búsqueda.
     * @param ean - (Opcional) EAN para búsqueda directa.
     * @param _timeout - Tiempo máximo de espera.
     * @returns Lista de productos normalizados.
     */
    async search(query: string, ean?: string, _timeout?: number): Promise<ProductResult[]> {
        const url = `https://${this.domain}/search?name=${encodeURIComponent(ean || query)}`;

        try {
            console.log(`[INSTALEAP] ${this.storeName} buscando: ${url}`);

            const headers = getStandardHeaders(this.domain, false);

            const res = await fetch(url, { headers });

            if (!res.ok) {
                console.error(`[INSTALEAP] ${this.storeName} falló: ${res.status}`);
                return [];
            }

            const html = await res.text();

            /**
             * Regex para encontrar bloques de productos en el formato Flight de Next.js.
             * Formato: \"product\":{\"name\":\"...\",\"price\":...}
             */
            const productRegex = /\\"product\\":\{[^}]*?\\"name\\":\\"(.*?)\\",\\"price\\":(\d+).*?\\"sku\\":\\"(.*?)\\"/g;

            const results: ProductResult[] = [];
            let match;

            while ((match = productRegex.exec(html)) !== null) {
                const name = match[1].replace(/\\u[0-9a-fA-F]{4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));
                const price = parseInt(match[2]);
                const sku = match[3];

                // Extraemos contexto cercano para buscar campos adicionales (EAN, fotos, stock)
                const context = html.substring(match.index, match.index + 4000);

                const eanMatch = context.match(/\\"(?:ean|barcode)\\":\[?\\"(.*?)\\"/);
                const photoMatch = context.match(/\\"(?:photosUrl|image|images)\\":\[?\\"(.*?)\\"/);
                const slugMatch = context.match(/\\"slug\\":\\"(.*?)\\"/);
                const brandMatch = context.match(/\\"brand\\":\\"(.*?)\\"/);
                const stockMatch = context.match(/\\"stock\\":(\d+)/);
                const fullPriceMatch = context.match(/\\"fullPrice\\":(\d+)/);
                const benefitMatch = context.match(/\\"(?:benefit|promotion|price)\\":\{[^}]*?\\"value\\":(\d+)/);
                const netPriceMatch = context.match(/\\"netPrice\\":(\d+)/);
                const lowPriceMatch = context.match(/\\"lowPrice\\":(\d+)/);

                const productEan = eanMatch ? eanMatch[1] : (ean || '');
                const mainImage = photoMatch ? photoMatch[1].replace(/\\/g, '') : '';
                const productSlug = slugMatch ? slugMatch[1] : '';
                const brand = brandMatch ? brandMatch[1] : '';
                const availability = (stockMatch && parseInt(stockMatch[1]) > 0) ? 'Disponible' : 'Agotado';

                // Lógica de precios para Instaleap (Next.js Flight)
                let finalPrice = price;
                let regularPrice = fullPriceMatch ? parseInt(fullPriceMatch[1]) : price;

                // Si encontramos un 'lowPrice', 'benefit' o 'netPrice', ese suele ser el final.
                if (lowPriceMatch) {
                    finalPrice = parseInt(lowPriceMatch[1]);
                    // Si lowPrice es igual al price original, pero hay un fullPrice tachado, lo usamos.
                    if (regularPrice === finalPrice && price > finalPrice) regularPrice = price;
                } else if (benefitMatch) {
                    finalPrice = parseInt(benefitMatch[1]);
                    if (price > finalPrice && regularPrice === finalPrice) regularPrice = price;
                } else if (netPriceMatch) {
                    finalPrice = parseInt(netPriceMatch[1]);
                }

                // Asegurar que regularPrice sea al menos finalPrice
                if (regularPrice < finalPrice) regularPrice = finalPrice;

                const discountPercentage = regularPrice > finalPrice ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100) : 0;

                // Usamos la utilidad centralizada para el gramaje
                const { amount: grams, unit } = extractGrams(name);

                results.push({
                    store: this.storeName,
                    productName: name,
                    price: finalPrice,
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
                    image: mainImage,
                    sourceUrl: url
                });

                if (results.length >= 15) break;
            }

            console.log(`[INSTALEAP] ${this.storeName} encontró ${results.length} productos.`);
            return results;

        } catch (e) {
            console.error(`[INSTALEAP] ${this.storeName} error: ${e}`);
            return [];
        }
    }
}

