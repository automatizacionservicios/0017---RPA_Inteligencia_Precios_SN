/**
 * Utility functions for data processing and formatting.
 */

/**
 * Extrae de forma robusta la cantidad y unidad de medida de un texto.
 * Versión sincronizada con el Backend (price-scraper).
 */
export function extractGrams(text: string): { amount: number; unit: string } | null {
  if (!text) return null;

  const normalized = text.toLowerCase().replace(/\s+/g, ' ');

  // 1. Caso especial: Unidades
  const undMatch = normalized.match(/(\d+)\s*(und|unidades|uds|paquetes?|pks?|bolsas?)\b/i);
  if (undMatch) {
    return { amount: parseInt(undMatch[1]), unit: 'und' };
  }

  // 2. Patrón principal (kg, g, gr, ml, lt, cc, lb, oz)
  const weightMatch = normalized.match(
    /(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|kg|kilo|ml|cc|lt?|litros?|lb|libra|oz|onzas?)\b/i
  );

  if (!weightMatch) {
    const lMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*l\b/i);
    if (lMatch) {
      const val = parseFloat(lMatch[1].replace(',', '.'));
      return { amount: val * 1000, unit: 'ml' };
    }
    return null;
  }

  const val = parseFloat(weightMatch[1].replace(',', '.'));
  const unitStr = weightMatch[2];

  if (unitStr.startsWith('kg') || unitStr.startsWith('kilo')) {
    return { amount: val * 1000, unit: 'g' };
  }
  if (unitStr === 'l' || unitStr.startsWith('litro') || unitStr === 'lt') {
    return { amount: val * 1000, unit: 'ml' };
  }
  if (unitStr.startsWith('lb') || unitStr.startsWith('libra')) {
    return { amount: val * 500, unit: 'g' };
  }
  if (unitStr.startsWith('oz') || unitStr.startsWith('onza')) {
    return { amount: Math.round(val * 28.35), unit: 'g' };
  }
  if (unitStr === 'cc') {
    return { amount: val, unit: 'ml' };
  }

  const finalUnit = unitStr.startsWith('m') || unitStr.startsWith('l') ? 'ml' : 'g';
  return { amount: val, unit: finalUnit };
}

/**
 * Normaliza un texto eliminando acentos, caracteres especiales y exceso de espacios.
 * Sincronizado con el backend.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cleans a price string and converts it to a number.
 */
export const cleanPrice = (price: string | number | undefined): number => {
  if (price === undefined || price === null) return 0;
  if (typeof price === 'number') return price;
  const cleaned = parseFloat(price.toString().replace(/[$,]/g, ''));
  return isNaN(cleaned) ? 0 : cleaned;
};

/**
 * Formats a number as a localized price string ($1.200).
 */
export const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null || isNaN(price)) return '---';
  return `$${price.toLocaleString('es-CO')}`;
};
