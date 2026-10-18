'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Customer } from '@/db/types/customer';
import { type CustomerFormData, customerService } from '@/features/customers/services/customerService';

export interface PosCustomersState {
    customers: Customer[];
    isLoading: boolean;
    loadCustomers: () => Promise<void>;
    addCustomer: (input: CustomerFormData) => Promise<Customer | null>;
}

export function usePosCustomers(): PosCustomersState {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const list = await customerService.loadCustomers();
            setCustomers(list);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCustomers();
    }, [loadCustomers]);

    const addCustomer = useCallback(async (input: CustomerFormData) => {
        const newCustomer = await customerService.createCustomer(input);
        if (newCustomer) {
            setCustomers((prev) => {
                const next = [...prev, newCustomer];
                next.sort((a, b) => a.name.localeCompare(b.name, 'id'));
                return next;
            });
        }
        return newCustomer;
    }, []);

    return {
        customers,
        isLoading,
        loadCustomers,
        addCustomer,
    };
}
