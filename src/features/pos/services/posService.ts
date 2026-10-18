import { salesRepository } from '@/db/repositories/salesRepository';
import type { SalesTransaction } from '@/db/types/sales';
import { notifyError, notifySuccess } from '@/utils/notifications';
import type { CreateSaleInput } from '../types';

export const posService = {
    async checkout(input: CreateSaleInput): Promise<SalesTransaction | null> {
        const result = await salesRepository.createSale(input);
        if (!result.success || !result.data) {
            notifyError({
                title: 'Transaksi Gagal',
                message: result.message || 'Gagal memproses transaksi penjualan.',
            });
            return null;
        }

        notifySuccess({
            title: 'Transaksi Berhasil',
            message: `Pesanan ${result.data.transactionNumber} berhasil dicatat.`,
        });
        return result.data;
    },
};
