import { normalizeText } from "./utils.ts";

export class ProductFilter {
    /**
     * Normalizes text for comparison using the shared utility.
     */
    static normalizeText(text: string): string {
        return normalizeText(text);
    }

    /**
     * Filters and sorts products based on a query and keyword matching.
     */
    static filterProducts(
        products: any[],
        query: string,
        keywords: string[] = [],
        brand?: string,
        category?: string
    ) {
        const normalizedQuery = this.normalizeText(query);
        const normalizedKeywords = keywords.map(k => this.normalizeText(k));
        const normalizedBrand = brand ? this.normalizeText(brand) : "";
        const normalizedCategory = category ? this.normalizeText(category) : "";

        // SIGNIFICANT TOKENS: terms with 3+ characters from the query
        const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length >= 3);
        const brandTokens = normalizedBrand.split(/\s+/).filter(t => t.length >= 2);
        const categoryTokens = normalizedCategory.split(/\s+/).filter(t => t.length >= 3);

        return products
            .filter(product => {
                const name = this.normalizeText(product.productName || "");
                const pBrand = this.normalizeText(product.brand || "");
                const combinedText = `${name} ${pBrand}`;

                // 1. Mandatory requirement: All explicit keywords (if any)
                if (normalizedKeywords.length > 0) {
                    const allKeywordsMatch = normalizedKeywords.every(k => combinedText.includes(k));
                    if (!allKeywordsMatch) return false;
                }

                // 2. Strict Search: Each token from the productName query MUST be present
                if (queryTokens.length > 0) {
                    const allQueryTokensMatch = queryTokens.every(token => combinedText.includes(token));
                    if (!allQueryTokensMatch) return false;
                }

                // 3. Brand Filter: If user specified a brand, it MUST be present (if not already matched)
                if (brandTokens.length > 0) {
                    const allBrandTokensMatch = brandTokens.every(token => combinedText.includes(token));
                    if (!allBrandTokensMatch) return false;
                }

                // 4. Category Filter: Optional but supportive
                if (categoryTokens.length > 0) {
                    const anyCategoryMatch = categoryTokens.some(token => combinedText.includes(token));
                    // We don't discard if category doesn't match for now (to be safe), 
                    // unless you want it strictly. User said "apoye en la busqueda".
                    // For now, only query and brand are strict.
                }

                return true;
            })
            .sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    /**
     * Processes grams/units to facilitate comparison.
     * (Logic placeholder based on CheerioStrategy)
     */
    static extractSpecs(name: string) {
        const gramsMatch = name.match(/(\d+)\s*(g|gr|kg|ml|l|lb)/i);
        return {
            size: gramsMatch ? gramsMatch[0] : null,
            value: gramsMatch ? parseInt(gramsMatch[1]) : null
        };
    }
}
