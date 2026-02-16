import { describe, it, expect } from 'vitest';
import { extractGrams, cleanPrice, formatPrice, normalizeText } from '@/core/utils';

describe('extractGrams', () => {
  it('should extract grams correctly', () => {
    expect(extractGrams('Cafe 500g')).toEqual({ amount: 500, unit: 'g' });
    expect(extractGrams('Cafe 500 gr')).toEqual({ amount: 500, unit: 'g' });
  });

  it('should extract kilograms and convert to grams', () => {
    expect(extractGrams('Cafe 1kg')).toEqual({ amount: 1000, unit: 'g' });
    expect(extractGrams('Cafe 2.5 kg')).toEqual({ amount: 2500, unit: 'g' });
  });

  it('should extract milliliters', () => {
    expect(extractGrams('Leche 900ml')).toEqual({ amount: 900, unit: 'ml' });
    expect(extractGrams('Aceite 1000 ml')).toEqual({ amount: 1000, unit: 'ml' });
  });

  it('should extract ounces and pounds (converted to grams)', () => {
    expect(extractGrams('Cafe 16oz')).toEqual({ amount: 454, unit: 'g' });
    expect(extractGrams('Cafe 1lb')).toEqual({ amount: 500, unit: 'g' });
  });

  it('should return null for strings without weight', () => {
    expect(extractGrams('Cafe Molido')).toBeNull();
    expect(extractGrams('')).toBeNull();
  });

  it('should handle decimals correctly', () => {
    expect(extractGrams('Cafe 1.5kg')).toEqual({ amount: 1500, unit: 'g' });
  });
  it('should handle special units like units, packages, bags', () => {
    expect(extractGrams('Papel 12 und')).toEqual({ amount: 12, unit: 'und' });
    expect(extractGrams('Galletas 3 paquetes')).toEqual({ amount: 3, unit: 'und' });
    expect(extractGrams('Pan 6 uds')).toEqual({ amount: 6, unit: 'und' });
  });

  it('should handle cc as ml', () => {
    expect(extractGrams('Gaseosa 250cc')).toEqual({ amount: 250, unit: 'ml' });
  });

  it('should handle liters correctly (l, lt, litro)', () => {
    expect(extractGrams('Agua 1.5 l')).toEqual({ amount: 1500, unit: 'ml' });
    expect(extractGrams('Leche 1 litro')).toEqual({ amount: 1000, unit: 'ml' });
    expect(extractGrams('Jugo 2 lt')).toEqual({ amount: 2000, unit: 'ml' });
  });
});

describe('normalizeText', () => {
  it('should remove accents and special characters', () => {
    expect(normalizeText('Café con Leche')).toBe('cafe con leche');
    expect(normalizeText('Árbol cigüeña')).toBe('arbol ciguena');
  });

  it('should remove extra spaces', () => {
    expect(normalizeText('  Pan   Integral  ')).toBe('pan integral');
  });

  it('should remove non-alphanumeric characters', () => {
    expect(normalizeText('Arroz (500g) - Oferta!')).toBe('arroz 500g oferta');
  });

  it('should handle empty strings', () => {
    expect(normalizeText('')).toBe('');
    // @ts-expect-error Testing null input
    expect(normalizeText(null)).toBe('');
    // @ts-expect-error Testing undefined input
    expect(normalizeText(undefined)).toBe('');
  });
});

describe('cleanPrice', () => {
  it('should clean price strings with currency and commas', () => {
    expect(cleanPrice('$1.200,00')).toBe(1.2); // parseFloat stops at comma if not handled
    // Wait, let's re-examine the original logic: .replace(/[$,]/g, "")
    // $1.200,00 -> 1.20000 -> 1.2? No, replace(/[$,]/g, "") on $1.200,00 -> "1.20000" -> parseFloat -> 1.2?
    // In Colombia, $1.200,00 means 1200 pesos.
    // If the original logic was .replace(/[$,]/g, ""), then "1.200,00" becomes "1.20000" which is 1.2.
    // Let's re-read useParetoData.ts: parseFloat(cols[3].replace(/[$,]/g, ""))
    // If the input is "1,200", replace -> "1200" -> 1200.
    // If the input is "1.200", replace -> "1.200" -> 1.2.
    // This looks like it might be designed for US format or a specific source format.
    // I must preserve it EXACTLY.
    expect(cleanPrice('$1,200.00')).toBe(1200);
    expect(cleanPrice('1.200')).toBe(1.2);
  });

  it('should handle numeric inputs', () => {
    expect(cleanPrice(1500)).toBe(1500);
  });

  it('should return 0 for invalid inputs', () => {
    expect(cleanPrice(undefined)).toBe(0);
    expect(cleanPrice('abc')).toBe(0);
  });
});

describe('formatPrice', () => {
  it('should format numbers correctly for es-CO', () => {
    // Note: JS locale formatting might vary slightly by environment but usually:
    // 1200 -> "$1.200"
    expect(formatPrice(1200)).toContain('1.200');
    expect(formatPrice(1200)).toContain('$');
  });

  it('should return placeholder for invalid numbers', () => {
    expect(formatPrice(undefined)).toBe('---');
    expect(formatPrice(NaN)).toBe('---');
  });
});
