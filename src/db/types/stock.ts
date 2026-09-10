export type StockAdjustmentType = 'DAMAGED' | 'LOST' | 'CORRECTION' | 'OTHER';
export type StockReferenceType = 'STOCK_ENTRY' | 'STOCK_ADJUSTMENT' | 'SALE';

export interface StockBalance {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    updatedAt?: string;
}

export interface StockEntry {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    unitCost: number;
    source: string;
    receivedAt: string;
    createdBy: string;
}

export interface StockAdjustment {
    id: string;
    productId: string;
    variantId: string | null;
    type: StockAdjustmentType;
    quantityChange: number;
    reason: string;
    note: string | null;
    createdBy: string;
    createdAt: string;
}

export interface StockHistory {
    id: string;
    productId: string;
    variantId: string | null;
    before: number;
    balance: number;
    referenceType: StockReferenceType;
    referenceId: string;
    createdAt: string;
}
