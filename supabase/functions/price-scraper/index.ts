import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { BenchmarkRequest, ProductResult } from "./interfaces/IProduct.ts";
import { StrategyFactory } from "./core/StrategyFactory.ts";
import { ProductFilter } from "./core/ProductFilter.ts";

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
            const deepLinks = ['d1', 'makro'];
            deepLinks.forEach(dl => {
                if (!storesToQuery.some(s => s.id === dl)) storesToQuery.push({ id: dl, name: dl, urls: [] });
            });
        }

        if (!query) throw new Error("Se requiere nombre del producto o EAN");

        console.log(`[ORCHESTRATOR] Searching for: ${query} (EAN: ${ean}) in ${storesToQuery.length} stores`);

        const results: ProductResult[] = [];
        const isRadar = body.isRadar || false;

        // --- DYNAMIC CONCURRENCY POOL ---
        // For audit/radar, we allow more concurrency, but we process in chunks to avoid overwhelming memory.
        const poolSize = isRadar ? 10 : 5;
        const scrapTimeout = isRadar ? 45000 : 25000;

        for (let i = 0; i < storesToQuery.length; i += poolSize) {
            const chunk = storesToQuery.slice(i, i + poolSize);
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

        // --- HARMONIZED FILTERING (Delegated to Core) ---
        // We only apply strict text filtering if we are NOT in deep EAN search mode
        let finalProducts = results;
        if (!ean) {
            finalProducts = ProductFilter.filterProducts(results, productName || query, keywords, brand, category);
        }

        // --- SPECIFIC EAN FILTERING (Extra Safety) ---
        if (ean) {
            const cleanTargetEan = ean.replace(/\D/g, '');
            finalProducts = finalProducts.filter(p => !p.ean || p.ean.replace(/\D/g, '') === cleanTargetEan);
        }

        // --- Final Sort & Diversity (Radar Optimization) ---
        if (isRadar) {
            const storeGroups: Record<string, ProductResult[]> = {};
            finalProducts.forEach(p => {
                if (!storeGroups[p.store]) storeGroups[p.store] = [];
                storeGroups[p.store].push(p);
            });

            const zipped: ProductResult[] = [];
            const storeNames = Object.keys(storeGroups);
            let index = 0;
            let hasMore = true;

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
        }

        console.log(`[ORCHESTRATOR] Returning ${finalProducts.length} results`);
        return new Response(JSON.stringify({ products: finalProducts }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(`[FATAL] ${error}`);
        return new Response(JSON.stringify({ error: (error as Error).message, status: 'error' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
