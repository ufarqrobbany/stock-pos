import { customerRepository } from '@/db/repositories/customerRepository';
import type { Customer } from '@/db/types/customer';
import type { CustomerFormData } from '@/features/customers/schemas/customerSchema';
import { notifyError, notifySuccess } from '@/utils/notifications';

export type { CustomerFormData };

export const customerService = {
    async loadCustomers(): Promise<Customer[]> {
        const result = await customerRepository.loadCustomers();
        if (!result.success || !result.data) {
            notifyError({ title: 'Gagal', message: result.message || 'Gagal memuat data pelanggan.' });
            return [];
        }
        return result.data;
    },

    async createCustomer(input: CustomerFormData): Promise<Customer | null> {
        const result = await customerRepository.createCustomer(input);
        if (!result.success || !result.data) {
            notifyError({ title: 'Gagal Menambah Pelanggan', message: result.message || 'Terjadi kesalahan.' });
            return null;
        }

        notifySuccess({
            title: 'Pelanggan Ditambahkan',
            message: `Pelanggan "${result.data.name}" berhasil didaftarkan.`,
        });
        return result.data;
    },
};
