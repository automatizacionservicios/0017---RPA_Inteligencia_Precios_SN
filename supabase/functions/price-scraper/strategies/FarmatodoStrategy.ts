import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";

export class FarmatodoStrategy implements ISearchStrategy {
    private config = {
        appId: 'VCOJEYD2PO',
        apiKey: 'eb9544fe7bfe7ec4c1aa5e5bf7740feb',
        indexName: 'products'
    };

    async search(query: string, ean?: string): Promise<ProductResult[]> {
        const url = `https://${this.config.appId.toLowerCase()}-dsn.algolia.net/1/indexes/*/queries`;

        // Prioritize EAN if available, Algolia handles it well usually
        const searchQuery = ean || query;

        const payload = {
            requests: [
                {
                    indexName: this.config.indexName,
                    params: `query=${encodeURIComponent(searchQuery)}&hitsPerPage=15`
                }
            ]
        };

        const headers: Record<string, string> = {
            'x-algolia-application-id': this.config.appId,
            'x-algolia-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
            'Referer': 'https://www.farmatodo.com.co/',
            'Origin': 'https://www.farmatodo.com.co'
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                console.error(`FarmatodoStrategy: Fetch failed ${res.status}`);
                return [];
            }

            const data = await res.json();
            const hits = data.results?.[0]?.hits || [];

            return hits.map((hit: any) => {
                const price = hit.fullPrice || hit.price || 0;
                // Use description or name, handle potential missing fields
                const productName = hit.description || hit.mediaDescription || hit.name || '';
                const productUrl = hit.slug
                    ? `https://www.farmatodo.com.co/p/${hit.slug}`
                    : `https://www.farmatodo.com.co/producto/${hit.id || hit.objectID}`;

                // Simple extraction, can utilize the util helper if we move it to a shared place later
                const gramsMatch = productName.match(/(\d+(?:\.\d+)?)\s*(g|gr|gramos|kg|ml|lt?|litros?|lb|libra|und|unidades)/i);
                const gramsAmount = gramsMatch ? parseFloat(gramsMatch[1]) * (gramsMatch[2].toLowerCase().startsWith('k') ? 1000 : 1) : 1;

                return {
                    store: 'FARMATODO',
                    productName: productName,
                    price: price,
                    pricePerGram: price / gramsAmount,
                    presentation: gramsMatch ? `${gramsMatch[1]}${gramsMatch[2]}` : 'Und',
                    gramsAmount: gramsAmount,
                    availability: (hit.hasStock && !hit.outofstore) ? 'Disponible' : 'Agotado',
                    url: productUrl,
                    verifiedDate: new Date().toISOString().split('T')[0],
                    brand: hit.marca || hit.brand || '',
                    ean: hit.barcode || hit.barcodeList?.[0] || '',
                    image: hit.image || hit.thumbnail || hit.image_url || hit.mediaDescription || '' // Algolia often has images
                };
            });

        } catch (e) {
            console.error(`FarmatodoStrategy: Error ${e}`);
            return [];
        }
    }
}


