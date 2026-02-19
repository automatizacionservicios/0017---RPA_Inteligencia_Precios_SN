/* eslint-disable */
// Preserving business logic to avoid regressions as per user requirement
import { ISearchStrategy } from '../interfaces/ISearchStrategy.ts';
import { ProductResult } from '../interfaces/IProduct.ts';
import { extractGrams, getStandardHeaders } from '../core/utils.ts';
import cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

/**
 * Estrategia de búsqueda basada en Scraping estático (Cheerio).
 *
 * Se utiliza para tiendas que no exponen una API pública clara o que renderizan
 * su contenido en el servidor (SSR). Extrae información directamente del HTML.
 */
export class CheerioStrategy implements ISearchStrategy {
  private config: any;
  private storeName: string;
  private limit: number;

  /**
   * @param config - Configuración específica de la tienda (selectores, dominios).
   * @param storeName - Nombre identificador de la tienda.
   * @param limit - Límite de resultados.
   */
  constructor(config: any, storeName: string, limit: number = 20) {
    this.config = config;
    this.storeName = storeName;
    this.limit = Math.min(Math.max(limit, 5), 50);
  }

  /**
   * Realiza la búsqueda de productos raspando el sitio web de la tienda a nivel nacional.
   *
   * @param query - Término de búsqueda o nombre del producto.
   * @param ean - (Opcional) EAN específico para filtrar o buscar.
   * @param timeout - Tiempo máximo de espera para la petición.
   * @returns Una lista de productos encontrados y normalizados.
   */
  async search(query: string, ean?: string, timeout?: number): Promise<ProductResult[]> {
    try {
      const searchBase = this.config.searchPath || '/?s=';
      const safeQuery = query || 'carnes';
      const cleanQuery = safeQuery.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
      const domain = this.config.domains[0];
      const url = `https://${domain}${searchBase}${encodeURIComponent(cleanQuery).replace(/%20/g, '+')}`;

      console.log(`[CHEERIO] ${this.storeName} raspando: ${url}`);

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), timeout || 15000);

      let res;
      try {
        res = await fetch(url, {
          signal: controller.signal,
          headers: getStandardHeaders(domain, false),
        });
      } finally {
        clearTimeout(fetchTimeout);
      }

      if (!res.ok) return [];

      const html = await res.text();
      const $ = cheerio.load(html);
      const products: ProductResult[] = [];
      const cards = $(this.config.selectors.productCard);

      cards.slice(0, this.limit).each((_i: number, el: any) => {
        try {
          const name = $(el).find(this.config.selectors.name).first().text().trim();

          // Lógica mejorada de extracción de precios
          const priceHtml = $(el).find(this.config.selectors.price).first();
          let priceText = '';
          let regularPriceText = '';

          // Si detectamos modo oferta por clase o por tener múltiples spans interiores
          if (priceHtml.hasClass('price--sale') || priceHtml.find('span').length >= 2) {
            const spans = priceHtml.find('span');
            if (spans.length >= 2) {
              // En Shopify/SuperMu, el primero suele ser el original (regular) y el segundo el actual
              regularPriceText = $(spans[0]).text().trim();
              priceText = $(spans[1]).text().trim();
            } else {
              priceText = priceHtml.text().trim();
            }
          } else {
            priceText = priceHtml.text().trim();
          }

          // Fallback para regularPrice si el selector explícito existe y no lo hemos llenado
          if (!regularPriceText && this.config.selectors.regularPrice) {
            const regPriceEl = $(el).find(this.config.selectors.regularPrice).first();
            regularPriceText = regPriceEl.text().trim();
          }

          // Limpieza: si el texto del precio contiene el texto del precio regular, lo quitamos
          if (regularPriceText && priceText.includes(regularPriceText)) {
            priceText = priceText.replace(regularPriceText, '').trim();
          }

          if (!name || !priceText) return;

          // Conversión numérica
          const price = this.config.transforms?.price
            ? this.config.transforms.price(priceText)
            : parseFloat(priceText.replace(/[^\d]/g, ''));

          let regularPrice = price;
          if (regularPriceText) {
            regularPrice = this.config.transforms?.price
              ? this.config.transforms.price(regularPriceText)
              : parseFloat(regularPriceText.replace(/[^\d]/g, ''));
          }

          const discountPercentage =
            regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

          if (!price || price < 50) return;

          const { amount: grams, unit } = extractGrams(name);

          let link =
            $(el)
              .find(this.config.selectors.url || 'a')
              .attr('href') || '';
          if (link && !link.startsWith('http')) {
            try {
              link = new URL(link, url).href;
            } catch (_e) {
              link = `https://${domain}${link.startsWith('/') ? '' : '/'}${link}`;
            }
          }

          let brand = '';
          if (this.config.selectors.brand) {
            brand = $(el).find(this.config.selectors.brand).text().trim();
          }

          let image = '';
          const imgSelectors = [this.config.selectors.image, 'img'];
          for (const sel of imgSelectors) {
            if (!sel) continue;
            const imgEl = $(el).find(sel).first();

            // Prioridad para atributos de alta resolución y evitar placeholders base64
            const rawImage =
              imgEl.attr('data-master') ||
              imgEl.attr('data-srcset')?.split(',')[0].split(' ')[0] ||
              imgEl.attr('srcset')?.split(',')[0].split(' ')[0] ||
              imgEl.attr('data-original') ||
              imgEl.attr('src') ||
              imgEl.attr('data-src') ||
              '';

            // Si es un placeholder base64 transparente, intentamos con el siguiente atributo si hay alguno más
            if (
              rawImage.startsWith('data:image/gif;base64') ||
              rawImage.startsWith('data:image/png;base64')
            ) {
              const fallbackImage =
                imgEl.attr('data-srcset')?.split(',')[0].split(' ')[0] ||
                imgEl.attr('srcset')?.split(',')[0].split(' ')[0] ||
                imgEl.attr('data-src') ||
                '';
              if (fallbackImage && !fallbackImage.startsWith('data:')) {
                image = fallbackImage;
              }
            } else {
              image = rawImage;
            }

            if (image) break;
          }

          if (image.includes('{width}')) image = image.replace('{width}', '600');
          if (image && !image.startsWith('http')) {
            image = `https:${image.startsWith('//') ? '' : '//'}${image.replace(/^\/\//, '')}`;
          }

          let productEan = '';
          if (ean && /^\d{8,14}$/.test(ean)) {
            productEan = ean;
          } else if (link) {
            const eanMatch = link.match(/\b(\d{13}|\d{12}|\d{8})\b/);
            if (eanMatch) productEan = eanMatch[1];
          }

          products.push({
            store: this.storeName,
            productName: name,
            price,
            regularPrice,
            discountPercentage,
            pricePerGram: price / (grams || 1),
            presentation: `${grams}${unit}`,
            gramsAmount: grams,
            availability: 'Disponible',
            url: link,
            verifiedDate: new Date().toISOString().split('T')[0],
            brand: brand || '',
            ean: productEan,
            image,
            sourceUrl: url,
          });
        } catch (_e) {
          // Ignorar errores en tarjetas individuales
        }
      });

      return products;
    } catch (e) {
      console.error(`[CHEERIO] Error en ${this.storeName}: ${e}`);
      return [];
    }
  }
}
