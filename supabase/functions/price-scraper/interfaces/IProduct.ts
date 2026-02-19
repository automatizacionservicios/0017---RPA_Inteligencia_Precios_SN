export interface Store {
  id: string;
  name: string;
  urls: string[];
}

export interface ProductResult {
  store: string;
  productName: string;
  price: number;
  pricePerGram: number; // calculated
  presentation: string; // e.g. "250g"
  gramsAmount: number;
  availability: string;
  url: string;
  verifiedDate: string;
  ean?: string;
  brand?: string;
  productType?: string;
  image?: string; // Added image field as per user's Meli snippet
  isExternalLink?: boolean; // For DeepLinkStrategy
  regularPrice?: number; // Precio original sin descuento
  discountPercentage?: number; // Porcentaje de descuento
  city?: string; // City name for geolocation verification
  sourceUrl?: string; // The exact URL (API or search) where the price was found
}

export interface BenchmarkRequest {
  productName?: string;
  selectedStores?: Store[];
  searchMode?: 'product' | 'store-catalog' | 'proxy';
  storeId?: string;
  categoryFilter?: string;
  keywords?: string[];
  negativeKeywords?: string[];
  ean?: string;
  brand?: string;
  category?: string;
  productLimit?: number; // Max products to fetch per store (default: 20, max: 50)
  isRadar?: boolean; // Flag to enable surgical optimization for Promo Radar
  locationId?: string; // id of the city for geo-localized search
  exactMatch?: boolean; // Enable exact string matching
  includeOutOfStock?: boolean; // Include products with no stock
}
