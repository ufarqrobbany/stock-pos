import { db } from '@/db';
import { type CreateStockEntryInput, stockEntryRepository } from '@/db/repositories/stockRepository';
import { notifyError, notifySuccess } from '@/utils/notifications';
import type { StockInItem } from '../stockInTable';

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
