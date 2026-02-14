import { ProductResult } from "./IProduct.ts";

export interface ISearchStrategy {
    search(query: string, ean?: string, timeout?: number): Promise<ProductResult[]>;
}

