import { type TransactionQueryParams, transactionRepository } from '@/db/repositories/transactionRepository';
import type { SalesTransaction } from '@/db/types/sales';
import type { PaginatedResult } from '@/types/common';
import { notifyError } from '@/utils/notifications';

export const transactionService = {
    async getTransactions(params: TransactionQueryParams): Promise<PaginatedResult<SalesTransaction>> {
        const result = await transactionRepository.getPaginated(params);

        if (!result.success || !result.data) {
            notifyError({
                title: 'Gagal Memuat Transaksi',
                message: result.message || 'Terjadi kesalahan pada sistem.',
            });
            return {
                items: [],
                total: 0,
                page: params.page || 1,
                pageSize: params.pageSize || 10,
                totalPages: 1,
            };
        }

        return result.data;
    },
};
