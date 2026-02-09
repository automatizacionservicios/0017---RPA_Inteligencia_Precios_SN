/**
 * Utility functions for price scraping strategies.
 */

/**
 * Extracts the amount and unit from a product name/description.
 * Supports g, gr, kg, ml, l, lb, oz, und and their variations.
 * Converts everything to a standard base (g or ml).
 */
export function extractGrams(text: string): { amount: number, unit: string } {
    if (!text) return { amount: 250, unit: 'g' };

    // Normalize text: lowercase, remove extra spaces
    const normalized = text.toLowerCase().replace(/\s+/g, ' ');

    // Main regex pattern for values and units
    // Handles decimal points (1.5) and commas (1,5)
    const weightMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|kg|kilo|ml|lt?|litros?|lb|libra|oz|onzas?|und|unidades)/i);

    if (!weightMatch) {
        // Fallback for standalone "L" pattern (e.g. "Leche 1 L")
        const lMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*l\b/i);
        if (lMatch) {
            const val = parseFloat(lMatch[1].replace(',', '.'));
            return { amount: val * 1000, unit: 'ml' };
        }
        // Default fallback
        return { amount: 250, unit: 'g' };
    }

    let val = parseFloat(weightMatch[1].replace(',', '.'));
    const unitStr = weightMatch[2];

    // Conversion logic
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

    if (unitStr.startsWith('und') || unitStr.startsWith('unidad')) {
        return { amount: val, unit: 'und' };
    }

    // Determine if it's liquid or solid
    const finalUnit = (unitStr.startsWith('m') || unitStr.startsWith('l')) ? 'ml' : 'g';
    return { amount: val, unit: finalUnit };
}

/**
 * Returns a semi-random User-Agent string to avoid basic blocking.
 */
export function getRandomUserAgent(): string {
    const uas = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    ];
    return uas[Math.floor(Math.random() * uas.length)];
}

/**
 * Generates a set of standard headers for web requests.
 */
export function getStandardHeaders(domain: string, isJson: boolean = false): Record<string, string> {
    const ua = getRandomUserAgent();
    return {
        'User-Agent': ua,
        'Accept': isJson ? 'application/json, text/plain, */*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': `https://${domain}/`,
        'Origin': `https://${domain}`,
        'Sec-Fetch-Dest': isJson ? 'empty' : 'document',
        'Sec-Fetch-Mode': isJson ? 'cors' : 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-CH-UA': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Upgrade-Insecure-Requests': '1'
    };
}
/**
 * Normalizes text by removing accents, lowercasing, and cleaning special characters.
 * Useful for robust product and brand matching.
 */
export function normalizeText(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s]/g, ' ') // Remove non-alphanumeric (replace with space)
        .replace(/\s+/g, ' ')
        .trim();
}
