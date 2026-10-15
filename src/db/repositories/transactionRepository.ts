import { db } from '@/db';
import type { SalesTransaction } from '@/db/types/sales';
import type { PaginatedResult } from '@/types/common';

export interface TransactionQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
}

export const transactionRepository = {
    async getPaginated(
        params: TransactionQueryParams
    ): Promise<{ success: boolean; data?: PaginatedResult<SalesTransaction>; message?: string }> {
        try {
            const page = params.page || 1;
            const pageSize = params.pageSize || 10;

            const collection = db.salesTransactions.orderBy('createdAt').reverse();

            if (params.search && params.search.trim() !== '') {
                const query = params.search.toLowerCase();
                const allData = await collection.toArray();
                const filtered = allData.filter(
                    (item: SalesTransaction) =>
                        item.transactionNumber.toLowerCase().includes(query) ||
                        item.customerName?.toLowerCase().includes(query)
                );

                const total = filtered.length;
                const totalPages = Math.ceil(total / pageSize) || 1;
                const start = (page - 1) * pageSize;
                const items = filtered.slice(start, start + pageSize);

                return {
                    success: true,
                    data: { items, total, page, pageSize, totalPages },
                };
            }

            const total = await db.salesTransactions.count();
            const totalPages = Math.ceil(total / pageSize) || 1;
            const items = await collection
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .toArray();

            return {
                success: true,
                data: { items, total, page, pageSize, totalPages },
            };
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return { success: false, message: 'Gagal mengambil data transaksi dari database.' };
        }
    },
};
