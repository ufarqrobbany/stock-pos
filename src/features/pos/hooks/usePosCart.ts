'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Customer } from '@/db/types/customer';
import type { ProductListItem, ProductListVariant } from '@/features/products/types';
import { notifyError } from '@/utils/notifications';
import type { PosCartItem } from '../types';

export interface PosCartState {
    cartItems: PosCartItem[];
    customerId: string | null;
    customerName: string;
    customerPhone: string;
    selectedCustomer: Customer | null;
    totalItems: number;
    totalAmount: number;
    setCustomerId: (id: string | null) => void;
    setCustomerName: (name: string) => void;
    handleSelectCustomer: (customer: Customer | null) => void;
    setCartItems: React.Dispatch<React.SetStateAction<PosCartItem[]>>;
    handleAddToCart: (product: ProductListItem) => void;
    handleAddVariantToCart: (product: ProductListItem, variant: ProductListVariant) => void;
    handleUpdateQuantity: (cartItemId: string, newQty: number) => void;
    handleRemoveItem: (cartItemId: string) => void;
    handleClearCart: () => void;
}

export function usePosCart(): PosCartState {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string>('');
    const [customerPhone, setCustomerPhone] = useState<string>('');
    const [cartItems, setCartItems] = useState<PosCartItem[]>([]);

    const handleSelectCustomer = useCallback((customer: Customer | null) => {
        setSelectedCustomer(customer);
        if (customer) {
            setCustomerId(customer.id);
            setCustomerName(customer.name);
            setCustomerPhone(customer.phone);
        } else {
            setCustomerId(null);
            setCustomerName('');
            setCustomerPhone('');
        }
    }, []);

    const totalItems = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [cartItems]);

    const totalAmount = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [cartItems]);

    const handleAddToCart = useCallback(
        (product: ProductListItem) => {
            if (product.stock <= 0) {
                notifyError({
                    title: 'Stok Habis',
                    message: `Produk "${product.name}" sedang habis.`,
                });
                return;
            }

            const existing = cartItems.find((item) => item.id === product.id && !item.variantId);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    notifyError({
                        title: 'Batas Stok',
                        message: `Stok tersedia hanya ${product.stock} unit.`,
                    });
                    return;
                }
                setCartItems((prev) =>
                    prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
                );
                return;
            }

            setCartItems((prev) => [
                ...prev,
                {
                    id: product.id,
                    productId: product.id,
                    productName: product.name,
                    price: product.price ?? 0,
                    quantity: 1,
                    maxStock: product.stock,
                    lowStockThreshold: product.lowStockThreshold,
                    imageUrl: product.imageUrl || product.image,
                },
            ]);
        },
        [cartItems]
    );

    const handleAddVariantToCart = useCallback(
        (product: ProductListItem, variant: ProductListVariant) => {
            if (variant.stock <= 0) {
                notifyError({
                    title: 'Stok Habis',
                    message: `Varian "${variant.name}" sedang habis.`,
                });
                return;
            }

            const cartItemId = `${product.id}-${variant.id}`;
            const existing = cartItems.find((item) => item.id === cartItemId);
            if (existing) {
                if (existing.quantity >= variant.stock) {
                    notifyError({
                        title: 'Batas Stok',
                        message: `Stok varian "${variant.name}" hanya ${variant.stock} unit.`,
                    });
                    return;
                }
                setCartItems((prev) =>
                    prev.map((item) => (item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item))
                );
                return;
            }

            setCartItems((prev) => [
                ...prev,
                {
                    id: cartItemId,
                    productId: product.id,
                    variantId: variant.id,
                    productName: product.name,
                    variantName: variant.name,
                    price: variant.price,
                    quantity: 1,
                    maxStock: variant.stock,
                    lowStockThreshold: variant.lowStockThreshold,
                    imageUrl: product.imageUrl || product.image,
                    sku: variant.sku,
                },
            ]);
        },
        [cartItems]
    );

    const handleUpdateQuantity = useCallback(
        (cartItemId: string, newQty: number) => {
            if (newQty <= 0) {
                setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
                return;
            }

            const targetItem = cartItems.find((item) => item.id === cartItemId);
            if (targetItem && newQty > targetItem.maxStock) {
                notifyError({
                    title: 'Batas Stok',
                    message: `Stok tersedia hanya ${targetItem.maxStock} unit.`,
                });
                setCartItems((prev) =>
                    prev.map((item) => (item.id === cartItemId ? { ...item, quantity: item.maxStock } : item))
                );
                return;
            }

            setCartItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item)));
        },
        [cartItems]
    );

    const handleRemoveItem = useCallback((cartItemId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    }, []);

    const handleClearCart = useCallback(() => {
        setCartItems([]);
        setSelectedCustomer(null);
        setCustomerId(null);
        setCustomerName('');
        setCustomerPhone('');
    }, []);

    return {
        cartItems,
        customerId,
        customerName,
        customerPhone,
        selectedCustomer,
        totalItems,
        totalAmount,
        setCustomerId,
        setCustomerName,
        handleSelectCustomer,
        setCartItems,
        handleAddToCart,
        handleAddVariantToCart,
        handleUpdateQuantity,
        handleRemoveItem,
        handleClearCart,
    };
}
