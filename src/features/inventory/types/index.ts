import type { PaginatedResult } from '@/types/common';

export interface StockEntryItem {
    id: string;
    productId: string;
    productName: string;
    variantId: string | null;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitCost: number;
    totalCost: number;
    source: string;
    receivedAt: string;
    createdBy: string;
}

export type StockEntryListResult = PaginatedResult<StockEntryItem>;

export interface CreateStockEntryInput {
    productId: string;
    variantId?: string | null;
    quantity: number;
    unitCost: number;
    source: string;
    receivedAt: string;
    createdBy?: string;
}

export interface StockEntryQuery {
    search?: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
