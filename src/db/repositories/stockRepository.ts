import { db } from '@/db';
import type { PaginatedResult, Result } from '@/types/common';
import type { StockAdjustment, StockAdjustmentType, StockEntry, StockHistory } from '../types/stock';

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

export interface StockQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
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

    async getAll({ page = 1, pageSize = 10, search }: StockQueryParams): Promise<Result<PaginatedResult<StockEntry>>> {
        try {
            let collection = db.stockEntries.orderBy('receivedAt').reverse();

            if (search?.trim()) {
                const keyword = search.trim().toLowerCase();
                const products = await db.products.toArray();
                const productIds = new Set(
                    products.filter((p) => p.name.toLowerCase().includes(keyword)).map((p) => p.id)
                );

                collection = collection.filter(
                    (entry) =>
                        entry.refNo.toLowerCase().includes(keyword) ||
                        entry.supplier.toLowerCase().includes(keyword) ||
                        productIds.has(entry.productId)
                );
            }

            const total = await collection.count();
            const items = await collection
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .toArray();

            return {
                success: true,
                data: {
                    items,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize) || 1,
                },
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal mengambil data stok masuk dari database',
            };
        }
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
            createdAt: now.toISOString(),
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

    async getAll({
        page = 1,
        pageSize = 10,
        search,
        type,
    }: StockQueryParams): Promise<Result<PaginatedResult<StockAdjustment>>> {
        try {
            let collection = db.stockAdjustments.orderBy('createdAt').reverse();

            if (type) {
                collection = collection.filter((adj) => adj.type === type);
            }

            if (search?.trim()) {
                const keyword = search.trim().toLowerCase();
                const products = await db.products.toArray();
                const productIds = new Set(
                    products.filter((p) => p.name.toLowerCase().includes(keyword)).map((p) => p.id)
                );

                collection = collection.filter((adj) => {
                    const dateStr = adj.createdAt.slice(0, 10).replace(/-/g, '');
                    const shortId = adj.id.slice(0, 4).toUpperCase();
                    const refNo = `SO-${dateStr}${shortId}`.toLowerCase();

                    return refNo.includes(keyword) || productIds.has(adj.productId);
                });
            }

            const total = await collection.count();
            const items = await collection
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .toArray();

            return {
                success: true,
                data: {
                    items,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize) || 1,
                },
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal mengambil data stock opname dari database',
            };
        }
    },
};

export const stockHistoryRepository = {
    async getAll({
        page = 1,
        pageSize = 10,
        search,
        type: referenceType,
    }: StockQueryParams & { type?: string }): Promise<Result<PaginatedResult<StockHistory>>> {
        try {
            let collection = db.stockHistories.orderBy('createdAt').reverse();

            if (referenceType) {
                collection = collection.filter((h) => h.referenceType === referenceType);
            }

            if (search?.trim()) {
                const keyword = search.trim().toLowerCase();
                const products = await db.products.toArray();
                const productIds = new Set(
                    products.filter((p) => p.name.toLowerCase().includes(keyword)).map((p) => p.id)
                );

                collection = collection.filter((h) => productIds.has(h.productId));
            }

            const total = await collection.count();
            const items = await collection
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .toArray();

            return {
                success: true,
                data: {
                    items,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize) || 1,
                },
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal mengambil data riwayat stok dari database',
            };
        }
    },
};
