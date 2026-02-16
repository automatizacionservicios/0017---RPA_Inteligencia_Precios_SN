/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import { normalizeText, extractGrams } from './utils.ts';

/**
 * Filtro de Productos (ProductFilter).
 *
 * Se encarga de procesar los resultados brutos de los scrapers para asegurar
 * que coincidan con los criterios de búsqueda (palabras clave, marcas, categorías)
 * y de ordenarlos por precio.
 */
export class ProductFilter {
  /**
   * Normaliza texto para comparaciones consistentes.
   * @param text - Texto a normalizar.
   */
  static normalizeText(text: string): string {
    return normalizeText(text);
  }

  /**
   * Filtra y ordena productos basándose en la consulta y palabras clave.
   *
   * Implementa una lógica de coincidencia estricta: todos los tokens significativos
   * de la consulta deben estar presentes en el nombre o marca del producto.
   *
   * @param products - Lista de productos a filtrar.
   * @param query - Término de búsqueda original.
   * @param keywords - Palabras clave adicionales obligatorias.
   * @param brand - Marca específica requerida.
   * @param category - Categoría sugerida (informativa).
   */
  static filterProducts(
    products: any[],
    query: string,
    keywords: string[] = [],
    brand?: string,
    category?: string
  ) {
    const normalizedQuery = this.normalizeText(query);
    const normalizedKeywords = keywords.map((k) => this.normalizeText(k));
    const normalizedBrand = brand ? this.normalizeText(brand) : '';
    const normalizedCategory = category ? this.normalizeText(category) : '';

    // TOKENS SIGNIFICATIVOS: términos de 3+ caracteres de la consulta
    const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length >= 3);
    const brandTokens = normalizedBrand.split(/\s+/).filter((t) => t.length >= 2);
    const categoryTokens = normalizedCategory.split(/\s+/).filter((t) => t.length >= 3);

    return products
      .filter((product) => {
        const name = this.normalizeText(product.productName || '');
        const pBrand = this.normalizeText(product.brand || '');
        const combinedText = `${name} ${pBrand}`;

        // 1. Requisito obligatorio: Todas las palabras clave explícitas (si existen)
        if (normalizedKeywords.length > 0) {
          const allKeywordsMatch = normalizedKeywords.every((k) => combinedText.includes(k));
          if (!allKeywordsMatch) return false;
        }

        // 2. Búsqueda estricta: Cada token del nombre de la consulta DEBE estar presente
        if (queryTokens.length > 0) {
          const allQueryTokensMatch = queryTokens.every((token) => combinedText.includes(token));
          if (!allQueryTokensMatch) return false;
        }

        // 3. Filtro de Marca: Si se especifica, DEBE estar presente
        if (brandTokens.length > 0) {
          const allBrandTokensMatch = brandTokens.every((token) => combinedText.includes(token));
          if (!allBrandTokensMatch) return false;
        }

        // 4. Filtro de Categoría: Es opcional/informativo por ahora
        // Se podría expandir para dar peso extra pero no excluye resultados.

        return true;
      })
      .sort((a, b) => (a.price || 0) - (b.price || 0));
  }

  /**
   * Extrae especificaciones (gramaje) de un nombre de producto.
   * @deprecated Utilizar `extractGrams` de `utils.ts` para lógica más robusta.
   */
  static extractSpecs(name: string) {
    const { amount, unit } = extractGrams(name);
    return {
      size: `${amount}${unit}`,
      value: amount,
    };
  }
}
