/**
 * Centralized Store and Search types
 */

export interface Store {
  /** Unique identifier for the store (e.g., 'exito', 'jumbo') */
  id: string;
  /** Human-readable name of the store */
  name: string;
  /** Whether the store is currently selected for searching */
  enabled: boolean;
  /** Primary domains/URLs associated with the store (optional) */
  urls?: string[];
}

export interface AdvancedOptions {
  /** Time range for price data freshness */
  searchRecency: 'day' | 'week' | 'month';
  /** Whether to perform more extensive web scraping/research */
  deepResearch: boolean;
}
