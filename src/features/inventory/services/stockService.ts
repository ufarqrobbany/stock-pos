import { db } from '@/db';
import {
    type CreateStockEntryInput,
    type StockAdjustmentInput,
    stockAdjustmentRepository,
    stockEntryRepository,
    stockHistoryRepository,
} from '@/db/repositories/stockRepository';
import type { StockAdjustment, StockEntry, StockHistory } from '@/db/types/stock';
import type { PaginatedResult } from '@/types/common';
import { notifyError, notifySuccess } from '@/utils/notifications';
import type { StockInItem } from '../stockInTable';
import type { StockOpnameItem } from '../stockOpnameTable';

export type StockHistoryItem = {
    id: string;
    productName: string;
    referenceType: 'STOCK_ENTRY' | 'STOCK_ADJUSTMENT' | 'SALE';
    before: number;
    change: number;
    after: number;
    date: string;
};

export const stockService = {
    async createStockEntry(input: CreateStockEntryInput): Promise<boolean> {
        const result = await stockEntryRepository.createStockIn(input);
        if (!result.success) {
            notifyError({ title: 'Gagal mencatat stok masuk.', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Berhasil', message: result.message });
        return true;
    },

    async loadStockInPaginated(params: {
        page?: number;
        pageSize?: number;
        search?: string;
    }): Promise<PaginatedResult<StockInItem>> {
        const result = await stockEntryRepository.getAll(params);
        const products = await db.products.toArray();

        if (!result.success || !result.data) {
            notifyError({ title: 'Gagal', message: result.message || 'Gagal memuat data stok masuk.' });
            return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10, totalPages: 1 };
        }

        const items = result.data.items.map((entry: StockEntry) => {
            const product = products.find((p) => p.id === entry.productId);
            return {
                id: entry.id,
                refNo: entry.refNo,
                productName: product?.name ?? 'Produk tidak ditemukan',
                supplier: entry.supplier,
                totalItems: entry.quantity,
                date: entry.receivedAt.slice(0, 10),
            };
        });

        return {
            items,
            total: result.data.total,
            page: result.data.page,
            pageSize: result.data.pageSize,
            totalPages: result.data.totalPages,
        };
    },
};

export const stockOpnameService = {
    async createStockAdjustment(input: StockAdjustmentInput): Promise<boolean> {
        const result = await stockAdjustmentRepository.createStockAdjustmentInput(input);
        if (!result.success) {
            notifyError({ title: 'Gagal mencatat penyesuaian stok.', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Berhasil', message: result.message });
        return true;
    },

    async loadStockOpnamePaginated(params: {
        page?: number;
        pageSize?: number;
        search?: string;
        type?: string;
    }): Promise<PaginatedResult<StockOpnameItem>> {
        const result = await stockAdjustmentRepository.getAll(params);
        const products = await db.products.toArray();

        if (!result.success || !result.data) {
            notifyError({ title: 'Gagal', message: result.message || 'Gagal memuat data Stock Opname.' });
            return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10, totalPages: 1 };
        }

        const items = result.data.items.map((adj: StockAdjustment) => {
            const product = products.find((p) => p.id === adj.productId);
            const dateStr = adj.createdAt.slice(0, 10).replace(/-/g, '');
            const shortId = adj.id.slice(0, 4).toUpperCase();

            return {
                id: adj.id,
                refNo: `SO-${dateStr}${shortId}`,
                productName: product?.name ?? 'Produk tidak ditemukan',
                type: adj.type,
                quantityChange: adj.quantityChange,
                reason: adj.reason,
                date: adj.createdAt.slice(0, 10),
            };
        });

        return {
            items,
            total: result.data.total,
            page: result.data.page,
            pageSize: result.data.pageSize,
            totalPages: result.data.totalPages,
        };
    },
};

export const stockHistoryService = {
    async loadStockHistoryPaginated(params: {
        page?: number;
        pageSize?: number;
        search?: string;
        referenceType?: string;
    }): Promise<PaginatedResult<StockHistoryItem>> {
        const result = await stockHistoryRepository.getAll({
            page: params.page,
            pageSize: params.pageSize,
            search: params.search,
            type: params.referenceType,
        });
        const products = await db.products.toArray();

        if (!result.success || !result.data) {
            notifyError({ title: 'Gagal', message: result.message || 'Gagal memuat riwayat stok.' });
            return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10, totalPages: 1 };
        }

        const items = result.data.items.map((history: StockHistory) => {
            const product = products.find((p) => p.id === history.productId);
            const change = history.balance - history.before;
            const dateObj = new Date(history.createdAt);
            const formattedDate = dateObj.toLocaleString('sv-SE').replace('T', ' ');

            return {
                id: history.id,
                productName: product?.name ?? 'Produk tidak ditemukan',
                referenceType: history.referenceType,
                before: history.before,
                change,
                after: history.balance,
                date: formattedDate,
            };
        });

        return {
            items,
            total: result.data.total,
            page: result.data.page,
            pageSize: result.data.pageSize,
            totalPages: result.data.totalPages,
        };
    },
};
