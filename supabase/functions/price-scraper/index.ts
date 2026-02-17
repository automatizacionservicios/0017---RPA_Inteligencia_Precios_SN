/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { BenchmarkRequest, ProductResult } from './interfaces/IProduct.ts';
import { StrategyFactory } from './core/StrategyFactory.ts';
import { ProductFilter } from './core/ProductFilter.ts';

/**
 * CORS Headers para permitir acceso desde el frontend.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Escuchador principal de la función Deno.
 *
 * Orquestador central encargado de recibir las peticiones de búsqueda,
 * gestionar la concurrencia de scrapers, aplicar filtros de relevancia
 * y normalizar las respuestas a nivel NACIONAL.
 */
serve(async (req: Request) => {
  // Manejo de peticiones preflight (CORS)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body: BenchmarkRequest = await req.json();
    let {
      productName,
      ean,
      selectedStores,
      searchMode,
      storeId,
      keywords,
      brand,
      category,
      productLimit,
    } = body;

    // 1. Parámetros por defecto
    const limit = productLimit ? Math.min(Math.max(productLimit, 5), 50) : 20;

    // 2. Auto-detección de EAN: Si el nombre parece un EAN, lo tratamos como tal
    if (!ean && productName && /^\d{8,14}$/.test(productName.trim())) {
      ean = productName.trim();
      productName = '';
    }

    let query = ean || productName || '';
    let storesToQuery = selectedStores || [];

    // 3. Lógica de selección de tiendas
    if (searchMode === 'store-catalog' && storeId) {
      // Modo catálogo: Buscar en una sola tienda
      if (!query && keywords && keywords.length > 0) query = keywords[0];
      storesToQuery = [{ id: storeId, name: storeId, urls: [] }];
    } else if (storesToQuery.length === 0) {
      // Modo benchmarking: Seleccionar todas las tiendas por defecto
      const allIds = StrategyFactory.getAllStoreIds();
      storesToQuery = allIds.map((id) => ({ id, name: id, urls: [] }));
      console.log(`[ORQUESTADOR] Selección automática: ${storesToQuery.length} tiendas`);
    }

    if (!query) throw new Error('Se requiere nombre del producto o EAN');

    console.log(
      `[ORQUESTADOR] Buscando: "${query}" (${ean ? 'EAN' : 'Texto'}) en ${storesToQuery.length} tiendas (Nivel Nacional)`
    );

    const results: ProductResult[] = [];
    const isRadar = body.isRadar || false;

    // 4. PARALELIZACIÓN Y RACING TIMEOUT (Condicional: EAN vs Nombre)
    const isEanSearch = !!ean;
    const DEFAULT_STORE_TIMEOUT = 15000;
    const globalTimeout = isRadar ? 52000 : 30000;

    // Para EAN, permitimos que cada tienda use casi todo el tiempo global
    const effectiveTimeout = isEanSearch ? (globalTimeout - 2000) : DEFAULT_STORE_TIMEOUT;

    const searchPromises = storesToQuery.map(async (store) => {
      const strategy = StrategyFactory.getStrategy(store.id, limit);
      if (!strategy) return [];

      try {
        // Cortafuegos por tienda: Timeout dinámico según tipo de búsqueda
        const storeResults = (await Promise.race([
          strategy.search(query, ean, effectiveTimeout),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('STORE_TIMEOUT')), effectiveTimeout)
          ),
        ])) as ProductResult[];

        return storeResults;
      } catch (e: any) {
        if (e.message === 'STORE_TIMEOUT') {
          console.warn(`[Tienda] ${store.id} agotó el tiempo de espera (Timeout ${effectiveTimeout / 1000}s)`);
        } else {
          console.error(`[Tienda] ${store.id}: ...  ERROR: ${e}`);
        }
        return [];
      }
    });

    // Esperamos a que todas las tiendas terminen o se agote el tiempo global de la función
    await Promise.race([
      Promise.allSettled(searchPromises),
      new Promise((resolve) => setTimeout(resolve, globalTimeout)),
    ]);

    // Recolectar resultados de las promesas que se cumplieron
    for (const p of searchPromises) {
      try {
        const res = await p;
        if (res && Array.isArray(res)) {
          results.push(...res);
        }
      } catch (e) {
        // Ya manejado individualmente, pero por seguridad
      }
    }

    // 5. FILTRADO ARMONIZADO (Delegado al Core)
    // Solo aplicamos filtrado por texto estricto si NO estamos buscando por un EAN específico
    let finalProducts = results;
    if (!ean) {
      finalProducts = ProductFilter.filterProducts(
        results,
        productName || query,
        keywords,
        brand,
        category
      );
    }

    // 6. FILTRADO EXTRA POR EAN (Seguridad)
    // Si hay un EAN objetivo, eliminamos cualquier resultado que tenga un EAN diferente
    if (ean) {
      const cleanTargetEan = ean.replace(/\D/g, '');
      finalProducts = finalProducts.filter(
        (p) => !p.ean || p.ean.replace(/\D/g, '') === cleanTargetEan
      );
    }

    // 7. OPTIMIZACIÓN DE DIVERSIDAD (Radar)
    // Entrelaza los resultados de diferentes tiendas para asegurar visibilidad multiplataforma
    if (isRadar) {
      const storeGroups: Record<string, ProductResult[]> = {};
      finalProducts.forEach((p) => {
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

    console.log(`[ORQUESTADOR] Retornando ${finalProducts.length} resultados.`);

    // 8. METADATOS DE RESPUESTA
    const responseMetadata = {
      products: finalProducts,
      metadata: {
        totalResults: finalProducts.length,
        queriedStores: storesToQuery.length,
        scope: 'National',
      },
    };

    return new Response(JSON.stringify(responseMetadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`[ORQUESTADOR] Error Fatal:`, error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message,
        status: 'error',
      }),
      {
        status: 200, // Retornamos 200 para que el frontend maneje el objeto de error grácilmente
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
