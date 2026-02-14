export interface MarketProduct {
  store: string; // Tienda donde se encontró el producto
  productName: string; // Nombre del producto tal como aparece en la tienda
  brand?: string; // Marca del producto (si está disponible)
  price: number; // Precio total del producto en la tienda
  pricePerGram: number; // Precio unitario por gramo para comparaciones
  presentation: string; // Presentación/forma del producto (bolsa, frasco, etc.)
  gramsAmount?: number; // Cantidad declarada en gramos de la presentación
  availability: string; // Estado de disponibilidad (en stock, agotado, etc.)
  url: string; // Enlace directo a la página del producto
  productType?: string; // Tipo de producto (molido, instantáneo, cápsulas, etc.)
  verifiedDate?: string; // Fecha de verificación/validación del producto (ISO string)
  category?: string; // Categoría del producto (cafe, carnicos, etc.)
  ean?: string; // Código EAN si está disponible
  regularPrice?: number; // Precio sin descuento (si aplica)
  discountPercentage?: number; // Porcentaje de descuento detectado
  isExternalLink?: boolean; // Si es un enlace de consulta externa
  image?: string; // URL de la imagen del producto
}

export interface BenchmarkMetadata {
  searchedLocation?: {
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
  } | null;
  totalResults?: number;
  queriedStores?: number;
  searchesPerformed?: number; // Número de búsquedas ejecutadas en el proceso
  sourcesEvaluated?: number; // Cantidad de fuentes/sitios evaluados
  confidenceLevel?: string; // Nivel de confianza agregado del resultado
  model?: string; // Modelo de IA utilizado para la evaluación
  validation?: {
    totalScraped: number; // Total de ítems extraídos del scraping inicial
    validated: number; // Ítems validados por las reglas/IA
    rejected: number; // Ítems rechazados por no cumplir criterios
    rejectionReasons: string[]; // Motivos principales de rechazo
    rejectedProducts?: Array<{
      productName: string; // Nombre del producto rechazado
      store: string; // Tienda de origen del producto rechazado
      reason: string; // Razón específica del rechazo
      presentation?: string; // Presentación del producto rechazado (si aplica)
    }>;
    processingTime: number; // Tiempo total de procesamiento/validación en milisegundos
  };
}

export interface BenchmarkResponse {
  products: MarketProduct[]; // Lista de productos resultados del benchmark
  citations?: string[]; // Citas o referencias a las fuentes utilizadas
  rawContent?: string; // Contenido bruto agregado del scraping/LLM
  metadata?: BenchmarkMetadata; // Metadatos del proceso de evaluación
  timestamp: string; // Fecha y hora del resultado (ISO string)
  searchQuery: string; // Consulta original utilizada para la búsqueda
}

export interface ParetoItem {
  ean?: string;
  productName: string;
  searchQuery: string;
  targetGrammage: number;
  category: 'cafe' | 'carnicos';
}
