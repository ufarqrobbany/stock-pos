import type { PaymentMethod } from '@/db/types/sales';

export interface PaymentMethodOption {
    value: PaymentMethod;
    label: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [{ value: 'CASH', label: 'Tunai' }];
