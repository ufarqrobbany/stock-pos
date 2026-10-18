import { db } from '@/db';
import type { Customer } from '@/db/types/customer';
import type { Result } from '@/types/common';

export type CreateCustomerInput = {
    name: string;
    phone: string;
    notes?: string | null;
};

export const customerRepository = {
    async loadCustomers(): Promise<Result<Customer[]>> {
        const customers = await db.customers.toArray();
        customers.sort((a, b) => a.name.localeCompare(b.name, 'id'));
        return { success: true, data: customers };
    },

    async loadCustomerById(id: string): Promise<Result<Customer | null>> {
        const customer = await db.customers.get(id);
        return { success: true, data: customer || null };
    },

    async createCustomer(data: CreateCustomerInput): Promise<Result<Customer>> {
        const name = data.name.trim();
        const phone = data.phone.trim();
        const notes = data.notes?.trim() || null;

        const existing = await db.customers.where('phone').equals(phone).first();
        if (existing) {
            return {
                success: false,
                data: null,
                message: `Nomor telepon "${phone}" sudah terdaftar atas nama ${existing.name}.`,
            };
        }

        const now = new Date().toISOString();
        const newCustomer: Customer = {
            id: crypto.randomUUID(),
            name,
            phone,
            notes: notes?.trim() || null,
            createdAt: now,
            updatedAt: now,
        };

        await db.customers.add(newCustomer);
        return {
            success: true,
            data: newCustomer,
            message: `Pelanggan "${newCustomer.name}" berhasil ditambahkan.`,
        };
    },
};
