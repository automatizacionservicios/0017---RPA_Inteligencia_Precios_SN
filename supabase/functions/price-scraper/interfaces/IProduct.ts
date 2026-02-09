
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
}
