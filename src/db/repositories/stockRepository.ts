import { db } from '@/db';
import type { Result } from '@/types/common';
import type { StockEntry } from '../types/stock';

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

function generateRefNo(date: string): string {
    const d = new Date(date);
    const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `IN-${yyyymm}${rand}`;
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
            refNo: generateRefNo(input.receivedAt),
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
