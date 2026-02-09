import { ISearchStrategy } from "../interfaces/ISearchStrategy.ts";
import { ProductResult } from "../interfaces/IProduct.ts";

export class DeepLinkStrategy implements ISearchStrategy {
    private storeName: string;
    private searchUrl: (q: string) => string;

    constructor(storeName: string, searchUrl: (q: string) => string) {
        this.storeName = storeName;
        this.searchUrl = searchUrl;
    }

    async search(query: string, ean?: string): Promise<ProductResult[]> {
        // This strategy doesn't actually scrape, it just returns a link
        // So we just wrap the query in a ProductResult
        const searchQuery = query || ean || "";
        if (!searchQuery) return [];

        return [{
            store: this.storeName,
            productName: `Consulta externa: ${searchQuery}`,
            price: 0,
            pricePerGram: 0,
            presentation: "Redirección Directa",
            gramsAmount: 0,
            availability: "Requiere consulta externa",
            url: this.searchUrl(searchQuery),
            verifiedDate: new Date().toISOString().split('T')[0],
            brand: "Link Externo",
            isExternalLink: true,
            image: ""
        }];
    }
}
