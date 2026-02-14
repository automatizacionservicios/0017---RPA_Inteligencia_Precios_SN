/**
 * Utilidades compartidas para las estrategias de scraping de precios.
 */

/**
 * Extrae de forma robusta la cantidad y unidad de medida de un texto (nombre o descripción del producto).
 * 
 * Esta función es crítica para normalizar los pesos y permitir la comparación de "precio por gramo".
 * Maneja una amplia variedad de formatos, incluyendo texto sucio, diferentes separadores decimales
 * y abreviaturas comunes en el mercado colombiano.
 * 
 * @param text - El texto del que se desea extraer la información (ej: "Arroz 500gr", "Leche 1.5 L").
 * @returns Un objeto con la cantidad (amount) normalizada y la unidad base (g, ml o und).
 * 
 * @example
 * extractGrams("Aceite 900ml") => { amount: 900, unit: 'ml' }
 * extractGrams("Harina 1 kg") => { amount: 1000, unit: 'g' }
 */
export function extractGrams(text: string): { amount: number, unit: string } {
    if (!text) return { amount: 250, unit: 'g' };

    // Normalización inicial: minúsculas y limpieza de espacios
    const normalized = text.toLowerCase().replace(/\s+/g, ' ');

    // 1. Caso especial: Unidades (und, unidades, paquetes) - Suele ser prioritario
    const undMatch = normalized.match(/(\d+)\s*(und|unidades|uds|paquetes?|pks?|bolsas?)\b/i);
    if (undMatch) {
        return { amount: parseInt(undMatch[1]), unit: 'und' };
    }

    // 2. Patrón principal: Valores numéricos seguidos de unidades de peso/volumen
    // Soporta decimales con punto (1.5) o coma (1,5)
    const weightMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|kg|kilo|ml|cc|lt?|litros?|lb|libra|oz|onzas?)\b/i);

    if (!weightMatch) {
        // Fallback: Buscar "L" sola al final o rodeada de espacios (ej: "1 L", "1.5L")
        const lMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*l\b/i);
        if (lMatch) {
            const val = parseFloat(lMatch[1].replace(',', '.'));
            return { amount: val * 1000, unit: 'ml' };
        }

        // Si no hay rastro de medidas, asumimos un valor promedio para evitar división por cero
        return { amount: 250, unit: 'g' };
    }

    let val = parseFloat(weightMatch[1].replace(',', '.'));
    const unitStr = weightMatch[2];

    // Conversión a unidades base (Gramos o Mililitros)

    // Kilogramos (kg, kilo) -> Gramos
    if (unitStr.startsWith('kg') || unitStr.startsWith('kilo')) {
        return { amount: val * 1000, unit: 'g' };
    }

    // Litros (l, lt, litro) -> Mililitros
    if (unitStr === 'l' || unitStr.startsWith('litro') || unitStr === 'lt') {
        return { amount: val * 1000, unit: 'ml' };
    }

    // Libras (lb, libra) -> Aproximado a 500g (estándar CO)
    if (unitStr.startsWith('lb') || unitStr.startsWith('libra')) {
        return { amount: val * 500, unit: 'g' };
    }

    // Onzas (oz, onza) -> Aproximado a 28.35g
    if (unitStr.startsWith('oz') || unitStr.startsWith('onza')) {
        return { amount: Math.round(val * 28.35), unit: 'g' };
    }

    // CC (Centímetros cúbicos) -> Mililitros
    if (unitStr === 'cc') {
        return { amount: val, unit: 'ml' };
    }

    // Determinar si la unidad resultante debe ser ML o G basado en el primer caracter
    // (m de ml -> ml, l de litro -> ml, el resto -> g)
    const finalUnit = (unitStr.startsWith('m') || unitStr.startsWith('l')) ? 'ml' : 'g';
    return { amount: val, unit: finalUnit };
}

/**
 * Perfiles de navegador para sincronizar el User-Agent con las cabeceras sec-ch-ua.
 * Esto es vital para evadir detecciones básicas de WAF (Cloudflare/Akamai).
 */
const BROWSER_PROFILES = [
    {
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        secChUa: '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        platform: '"Windows"',
        mobile: '?0'
    },
    {
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/121.0.0.0 Safari/537.36',
        secChUa: '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
        platform: '"Windows"',
        mobile: '?0'
    }
];

/**
 * Retorna un perfil de navegador aleatorio para diversificar las peticiones.
 */
export function getRandomBrowserProfile() {
    return BROWSER_PROFILES[Math.floor(Math.random() * BROWSER_PROFILES.length)];
}

/**
 * Genera un conjunto de cabeceras HTTP estándar para las peticiones.
 * 
 * @param domain - El dominio al que se realiza la petición (para Referer y Origin).
 * @param isJson - Indica si la petición espera una respuesta JSON (modifica Accept y Sec-Fetch).
 * @returns Un objeto con las cabeceras configuradas.
 */
export function getStandardHeaders(domain: string, isJson: boolean = false): Record<string, string> {
    const profile = getRandomBrowserProfile();
    return {
        'User-Agent': profile.ua,
        'Accept': isJson ? 'application/json, text/plain, */*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': `https://${domain}/`,
        'Origin': `https://${domain}`,
        'Sec-Fetch-Dest': isJson ? 'empty' : 'document',
        'Sec-Fetch-Mode': isJson ? 'cors' : 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-CH-UA': profile.secChUa,
        'Sec-CH-UA-Mobile': profile.mobile,
        'Sec-CH-UA-Platform': profile.platform,
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Pragma': 'no-cache'
    };
}

/**
 * Normaliza un texto eliminando acentos, caracteres especiales y excesos de espacios.
 * Ideal para comparaciones de nombres de productos o marcas.
 * 
 * @param text - Texto a normalizar.
 * @returns Texto limpio en minúsculas.
 */
export function normalizeText(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
        .replace(/[^a-z0-9\s]/g, ' ') // Reemplazar no-alfanuméricos por espacio
        .replace(/\s+/g, ' ')
        .trim();
}

