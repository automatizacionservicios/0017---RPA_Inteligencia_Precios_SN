import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { BenchmarkRequest, ProductResult } from "./interfaces/IProduct.ts";
import { normalizeText } from "./core/utils.ts";
import { StrategyFactory } from "./core/StrategyFactory.ts";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const body: BenchmarkRequest = await req.json();
        let { productName, ean, selectedStores, searchMode, storeId, keywords, brand, category, productLimit } = body;

        // Setup defaults
        const limit = productLimit ? Math.min(Math.max(productLimit, 5), 50) : 20;

        // Auto-detect EAN
        if (!ean && productName && /^\d{8,14}$/.test(productName.trim())) {
            ean = productName.trim();
            productName = '';
        }

        let query = ean || productName || '';
        let storesToQuery = selectedStores || [];

        // Store selection logic
        if (searchMode === 'store-catalog' && storeId) {
            if (!query && keywords && keywords.length > 0) query = keywords[0];
            storesToQuery = [{ id: storeId, name: storeId, urls: [] }];
        } else if (storesToQuery.length === 0) {
            storesToQuery = StrategyFactory.getAllStoreIds().map(id => ({ id, name: id, urls: [] }));
        }

        // Add default external stores
        if (!selectedStores && !storeId) {
            const deepLinks = ['d1', 'makro', 'berpa'];
            deepLinks.forEach(dl => {
                if (!storesToQuery.some(s => s.id === dl)) storesToQuery.push({ id: dl, name: dl, urls: [] });
            });
        }

        if (!query) throw new Error("Se requiere nombre del producto o EAN");

        console.log(`[ORCHESTRATOR] Searching for: ${query} (EAN: ${ean}) in ${storesToQuery.length} stores`);

        const results: ProductResult[] = [];
        const isRadar = body.isRadar || false;
        const chunkSize = isRadar ? 25 : 5;
        const scrapTimeout = isRadar ? 45000 : 15000;

        for (let i = 0; i < storesToQuery.length; i += chunkSize) {
            const chunk = storesToQuery.slice(i, i + chunkSize);
            const promises = chunk.map(async (store) => {
                if (store.id === 'mercadolibre') return [];
                const strategy = StrategyFactory.getStrategy(store.id, limit);
                if (!strategy) return [];
                try {
                    return await strategy.search(query, ean, scrapTimeout);
                } catch (e) {
                    console.error(`[ORCHESTRATOR] Error in ${store.id}: ${e}`);
                    return [];
                }
            });
            const chunkResults = await Promise.all(promises);
            chunkResults.forEach(r => results.push(...r));
        }

        // --- HARMONIZED FILTERING (Deterministic) ---
        let finalProducts = results;

        if (ean) {
            const cleanTargetEan = ean.replace(/\D/g, '');
            finalProducts = finalProducts.filter(p => !p.ean || p.ean.replace(/\D/g, '') === cleanTargetEan);
        } else {
            const brandTerm = normalizeText(brand || '');
            const searchTerms = [
                ...normalizeText(productName || '').split(/\s+/),
                ...(Array.isArray(keywords) ? keywords.map(k => normalizeText(k)) : [])
            ].filter(t => t.length > 1);

            console.log(`[ORCHESTRATOR] Filtering. Brand: '${brandTerm}' | Tokens: [${searchTerms.join(', ')}]`);

            finalProducts = finalProducts.filter(p => {
                if (!p.price || p.price <= 1) return false;

                const normName = normalizeText(p.productName);
                const normBrand = normalizeText(p.brand || '');
                const fullText = `${normName} ${normBrand} ${normalizeText(p.productType || '')}`;

                // 1. Strict Brand Match
                if (brandTerm) {
                    const brandFound = normName.includes(brandTerm) || normBrand.includes(brandTerm);
                    if (!brandFound) return false;
                }

                // 2. Token Match rate
                if (searchTerms.length > 0) {
                    const matchedTokens = searchTerms.filter(token => fullText.includes(token));
                    const matchRate = matchedTokens.length / searchTerms.length;
                    const threshold = searchTerms.length <= 2 ? 1.0 : 0.75;
                    if (matchRate < threshold) return false;
                }

                // 3. Competition Filter
                const isBimboSearch = searchTerms.some(t => t.includes('bimbo'));
                if (isBimboSearch) {
                    const competitors = ['servipan', 'comapan', 'mama ines', 'el country', 'casero', 'lalo', 'santa clara'];
                    if (competitors.some(c => fullText.includes(c))) return false;
                }

                return true;
            });
        }

        // --- Final Sort & Diversity ---
        if (isRadar) {
            const storeGroups: Record<string, ProductResult[]> = {};
            finalProducts.forEach(p => {
                if (!storeGroups[p.store]) storeGroups[p.store] = [];
                storeGroups[p.store].push(p);
            });

            Object.values(storeGroups).forEach(group => {
                group.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
            });

            const zipped: ProductResult[] = [];
            const storeNames = Object.keys(storeGroups);
            let hasMore = true;
            let index = 0;

            while (hasMore) {
                hasMore = false;
                for (const storeName of storeNames) {
                    const product = storeGroups[storeName][index];
                    if (product) {
                        zipped.push(product);
                        hasMore = true;
                    }
                }
                index++;
            }
            finalProducts = zipped;
        } else {
            finalProducts.sort((a, b) => {
                if (ean) {
                    const cleanTarget = ean.replace(/\D/g, '');
                    const aEan = a.ean?.replace(/\D/g, '') === cleanTarget;
                    const bEan = b.ean?.replace(/\D/g, '') === cleanTarget;
                    if (aEan && !bEan) return -1;
                    if (!aEan && bEan) return 1;
                }
                return 0;
            });
        }

        console.log(`[ORCHESTRATOR] Returning ${finalProducts.length} results`);
        return new Response(JSON.stringify({ products: finalProducts }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(`[FATAL] ${error}`);
        return new Response(JSON.stringify({ error: (error as Error).message, status: 'error' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
