import { describe, it, expect } from 'vitest';
import { extractGrams, cleanPrice, formatPrice } from '@/core/utils';

describe('extractGrams', () => {
  it('should extract grams correctly', () => {
    expect(extractGrams('Cafe 500g')).toBe(500);
    expect(extractGrams('Cafe 500 gr')).toBe(500);
  });

  it('should extract kilograms and convert to grams', () => {
    expect(extractGrams('Cafe 1kg')).toBe(1000);
    expect(extractGrams('Cafe 2.5 kg')).toBe(2500);
  });

  it('should extract milliliters', () => {
    expect(extractGrams('Leche 900ml')).toBe(900);
    expect(extractGrams('Aceite 1000 ml')).toBe(1000);
  });

  it('should extract ounces and pounds (as per regex)', () => {
    expect(extractGrams('Cafe 16oz')).toBe(16);
    expect(extractGrams('Cafe 1lb')).toBe(1);
  });

  it('should return null for strings without weight', () => {
    expect(extractGrams('Cafe Molido')).toBeNull();
    expect(extractGrams('')).toBeNull();
  });

  it('should handle decimals correctly', () => {
    expect(extractGrams('Cafe 1.5kg')).toBe(1500);
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
