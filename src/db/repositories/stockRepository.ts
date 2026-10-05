import { db } from '@/db';
import type { Result } from '@/types/common';
import type { StockAdjustment, StockAdjustmentType, StockEntry } from '../types/stock';

export interface CreateStockEntryInput {
    productId: string;
    variantId: string | null;
    quantity: number;
    unitCost: number;
    supplier: string;
    source: string;
    receivedAt: string;
    createdBy: string;
}

export interface StockAdjustmentInput {
    productId: string;
    variantId: string | null;
    type: StockAdjustmentType;
    quantityChange: number;
    reason: string;
    note?: string | null;
    createdBy: string;
}

function generateRefNo(prefix: 'IN' | 'SO', date: string): string {
    const d = new Date(date);
    const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}-${yyyymm}${rand}`;
}

export const stockEntryRepository = {
    async createStockIn(input: CreateStockEntryInput): Promise<Result<StockEntry>> {
        const entry: StockEntry = {
            id: crypto.randomUUID(),
            productId: input.productId,
            variantId: input.variantId,
            quantity: input.quantity,
            unitCost: input.unitCost,
            supplier: input.supplier,
            refNo: generateRefNo('IN', input.receivedAt),
            source: input.source,
            receivedAt: input.receivedAt,
            createdBy: input.createdBy,
        };

        await db.transaction('rw', [db.stockEntries, db.stockBalances, db.stockHistories], async () => {
            await db.stockEntries.add(entry);

            const existingBalance = await db.stockBalances
                .where('productId')
                .equals(entry.productId)
                .and((b) => b.variantId === entry.variantId)
                .first();

            const before = existingBalance?.quantity ?? 0;
            const after = before + entry.quantity;

            if (existingBalance) {
                await db.stockBalances.update(existingBalance.id, {
                    quantity: after,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                await db.stockBalances.add({
                    id: crypto.randomUUID(),
                    productId: entry.productId,
                    variantId: entry.variantId,
                    quantity: after,
                    updatedAt: new Date().toISOString(),
                });
            }

            await db.stockHistories.add({
                id: crypto.randomUUID(),
                productId: entry.productId,
                variantId: entry.variantId,
                before,
                balance: after,
                referenceType: 'STOCK_ENTRY',
                referenceId: entry.id,
                createdAt: new Date().toISOString(),
            });
        });

        return { success: true, data: entry, message: 'Stok masuk berhasil dicatat.' };
    },

    async loadStockEntries(): Promise<Result<StockEntry[]>> {
        const entries = await db.stockEntries.orderBy('receivedAt').reverse().toArray();
        return { success: true, data: entries };
    },
};

export const stockAdjustmentRepository = {
    async createStockAdjustmentInput(input: StockAdjustmentInput): Promise<Result<StockAdjustment>> {
        const now = new Date();
        const adjustment: StockAdjustment = {
            id: crypto.randomUUID(),
            productId: input.productId,
            variantId: input.variantId,
            type: input.type,
            quantityChange: input.quantityChange,
            reason: input.reason,
            note: input.note ?? null,
            createdBy: input.createdBy,
            createdAt: new Date().toISOString(),
        };

        await db.transaction('rw', [db.stockAdjustments, db.stockBalances, db.stockHistories], async () => {
            await db.stockAdjustments.add(adjustment);

            const existingBalance = await db.stockBalances
                .where('productId')
                .equals(adjustment.productId)
                .and((b) => b.variantId === adjustment.variantId)
                .first();

            const before = existingBalance?.quantity ?? 0;
            const after = before + adjustment.quantityChange;

            if (existingBalance) {
                await db.stockBalances.update(existingBalance.id, {
                    quantity: after,
                    updatedAt: now.toISOString(),
                });
            } else {
                await db.stockBalances.add({
                    id: crypto.randomUUID(),
                    productId: adjustment.productId,
                    variantId: adjustment.variantId,
                    quantity: after,
                    updatedAt: now.toISOString(),
                });
            }

            await db.stockHistories.add({
                id: crypto.randomUUID(),
                productId: adjustment.productId,
                variantId: adjustment.variantId,
                before,
                balance: after,
                referenceType: 'STOCK_ADJUSTMENT',
                referenceId: adjustment.id,
                createdAt: now.toISOString(),
            });
        });

        return { success: true, data: adjustment, message: 'Penyesuaian stok berhasil dicatat.' };
    },

    async loadStockAdjustments(): Promise<Result<StockAdjustment[]>> {
        const adjustments = await db.stockAdjustments.orderBy('createdAt').reverse().toArray();
        return { success: true, data: adjustments };
    },
};
