import type { Category } from '@/db/types/product';
import type {
    PaymentMethod,
    PaymentStatus,
    SalesTransaction,
    SalesTransactionItem,
    TransactionStatus,
} from '@/db/types/sales';
import type { ProductListItem, ProductListVariant } from '@/features/products/types';

export type {
    Category,
    PaymentMethod,
    PaymentStatus,
    ProductListItem,
    ProductListVariant,
    SalesTransaction,
    SalesTransactionItem,
    TransactionStatus,
};

export interface PosCartItem {
    id: string;
    productId: string;
    variantId?: string | null;
    productName: string;
    variantName?: string | null;
    price: number;
    quantity: number;
    maxStock: number;
    lowStockThreshold?: number;
    imageUrl?: string | null;
    sku?: string;
}

export interface CheckoutParams {
    cashierId?: string;
    customerId?: string | null;
    customerName?: string | null;
    paymentMethod: PaymentMethod;
    amountPaid?: number;
}

export interface CreateSaleInput {
    cashierId: string;
    customerId?: string | null;
    customerName?: string | null;
    paymentMethod: PaymentMethod;
    amountPaid?: number;
    items: PosCartItem[];
}
