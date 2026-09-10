export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';
export type PaymentStatus = 'PAID' | 'UNPAID';
export type TransactionStatus = 'COMPLETED' | 'CANCELLED';

export interface SalesTransaction {
    id: string;
    transactionNumber: string;
    cashierId: string;
    customerId: string | null;
    customerName?: string | null;
    total: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    status: TransactionStatus;
    createdAt: string;
}

export interface SalesTransactionItem {
    id: string;
    transactionId: string;
    productId: string;
    variantId: string | null;
    productNameSnapshot: string;
    variantNameSnapshot: string | null;
    skuSnapshot: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}
