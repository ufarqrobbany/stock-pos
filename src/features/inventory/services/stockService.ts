import { db } from '@/db';
import {
    type CreateStockEntryInput,
    type StockAdjustmentInput,
    stockAdjustmentRepository,
    stockEntryRepository,
    stockHistoryRepository,
} from '@/db/repositories/stockRepository';
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
    // STOCK IN
    async createStockEntry(input: CreateStockEntryInput): Promise<boolean> {
        const result = await stockEntryRepository.createStockIn(input);
        if (!result.success) {
            notifyError({ title: 'Gagal mencatat stok masuk.', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Berhasil', message: result.message });
        return true;
    },

    async loadStockInList(): Promise<StockInItem[]> {
        const [entriesRes, products] = await Promise.all([
            stockEntryRepository.loadStockEntries(),
            db.products.toArray(),
        ]);

        if (!entriesRes.success || !entriesRes.data) {
            notifyError({ title: 'Gagal', message: 'Gagal memuat data stok masuk.' });
            return [];
        }

        return entriesRes.data.map((entry) => {
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
    },
};

// STOCK OPNAME
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

    async loadStockOpnameList(): Promise<StockOpnameItem[]> {
        const [adjustmentsRes, products] = await Promise.all([
            stockAdjustmentRepository.loadStockAdjustments(),
            db.products.toArray(),
        ]);

        if (!adjustmentsRes.success || !adjustmentsRes.data) {
            notifyError({ title: 'Gagal', message: 'Gagal memuat data Stock Opname.' });
            return [];
        }

        return adjustmentsRes.data.map((adj) => {
            const product = products.find((p) => p.id === adj.productId);
            const dateStr = adj.createdAt.slice(0, 10).replace(/-/g, '');
            const shortId = adj.id.slice(0, 4).toUpperCase();

            return {
                id: adj.id,
                refNo: `SO-${dateStr}${shortId}`,
                // sku: product?.sku ?? '-',
                productName: product?.name ?? 'Produk tidak ditemukan',
                type: adj.type,
                quantityChange: adj.quantityChange,
                reason: adj.reason,
                date: adj.createdAt.slice(0, 10),
            };
        });
    },
};

// STOCK HISTORY
export const stockHistoryService = {
    async loadStockHistoryList(): Promise<StockHistoryItem[]> {
        const [historiesRes, products] = await Promise.all([
            stockHistoryRepository.loadStockHistories(),
            db.products.toArray(),
        ]);

        if (!historiesRes.success || !historiesRes.data) {
            notifyError({ title: 'Gagal', message: 'Gagal memuat riwayat stok.' });
            return [];
        }

        return historiesRes.data.map((history) => {
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
    },
};
