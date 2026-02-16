/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import { ISearchStrategy } from '../interfaces/ISearchStrategy.ts';
import { ProductResult } from '../interfaces/IProduct.ts';
import { extractGrams } from '../core/utils.ts';

/**
 * Estrategia de búsqueda para Farmatodo.
 *
 * Utiliza la API de búsqueda de Algolia que proporciona Farmatodo en su sitio web.
 * Es altamente eficiente y devuelve datos estructurados incluyendo EANs y marcas.
 */
export class FarmatodoStrategy implements ISearchStrategy {
  private config = {
    appId: 'VCOJEYD2PO',
    apiKey: 'eb9544fe7bfe7ec4c1aa5e5bf7740feb',
    indexName: 'products',
  };

  /**
   * Realiza la búsqueda de productos en Farmatodo mediante Algolia.
   *
   * @param query - Término de búsqueda.
   * @param ean - (Opcional) EAN para búsqueda directa.
   * @param _timeout - Tiempo límite.
   * @returns Una lista de productos normalizados.
   */
  async search(query: string, ean?: string, _timeout?: number): Promise<ProductResult[]> {
    const url = `https://${this.config.appId.toLowerCase()}-dsn.algolia.net/1/indexes/*/queries`;

    // Priorizar EAN para mayor precisión si está presente
    const searchQuery = ean || query;

    const payload = {
      requests: [
        {
          indexName: this.config.indexName,
          params: `query=${encodeURIComponent(searchQuery)}&hitsPerPage=15`,
        },
      ],
    };

    const headers: Record<string, string> = {
      'x-algolia-application-id': this.config.appId,
      'x-algolia-api-key': this.config.apiKey,
      'Content-Type': 'application/json',
      Referer: 'https://www.farmatodo.com.co/',
      Origin: 'https://www.farmatodo.com.co',
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(`[FARMATODO] Falló fetch: ${res.status}`);
        return [];
      }

      const data = await res.json();
      const hits = data.results?.[0]?.hits || [];

      return hits.map((hit: any) => {
        const price = hit.price || hit.fullPrice || 0;
        const regularPrice = hit.priceOriginal || hit.fullPrice || hit.oldPrice || price;
        const productName = hit.description || hit.mediaDescription || hit.name || '';
        const productUrl = hit.slug
          ? `https://www.farmatodo.com.co/p/${hit.slug}`
          : `https://www.farmatodo.com.co/producto/${hit.id || hit.objectID}`;

        // Usamos la utilidad centralizada para extraer gramos/ml
        const { amount: grams, unit } = extractGrams(productName);

        const discountPercentage =
          regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

        return {
          store: 'FARMATODO',
          productName: productName,
          price: price,
          regularPrice: regularPrice,
          discountPercentage: discountPercentage,
          pricePerGram: price / (grams || 1),
          presentation: `${grams}${unit}`,
          gramsAmount: grams,
          availability: hit.hasStock && !hit.outofstore ? 'Disponible' : 'Agotado',
          url: productUrl,
          verifiedDate: new Date().toISOString().split('T')[0],
          brand: hit.marca || hit.brand || '',
          ean: hit.barcode || hit.barcodeList?.[0] || '',
          image: hit.image || hit.image_url || hit.thumbnail || '',
          sourceUrl: url,
        };
      });
    } catch (e) {
      console.error(`[FARMATODO] Error: ${e}`);
      return [];
    }
  }
}
