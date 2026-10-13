'use client';

import { useRouter } from 'next/navigation';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { confirmDelete } from '@/utils/confirmModal';
import { productService } from '../services/productService';
import type { ProductListItem } from '../types';
import { type ProductsState, useProducts } from './useProducts';

interface ProductContextValue extends ProductsState {
    expandedProductIds: Set<string>;
    toggleExpandedProduct: (productId: string) => void;
    isExpanded: (productId: string) => boolean;
    handleEdit: (productId: string) => void;
    handleStatusChange: (product: ProductListItem, isActive: boolean) => Promise<void>;
    handleDelete: (product: ProductListItem) => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

interface ProductProviderProps {
    children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
    const router = useRouter();
    const productState = useProducts();
    const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());

    const toggleExpandedProduct = useCallback((productId: string) => {
        setExpandedProductIds((current) => {
            const next = new Set(current);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    }, []);

    const isExpanded = useCallback((productId: string) => expandedProductIds.has(productId), [expandedProductIds]);

    const handleEdit = useCallback(
        (productId: string) => {
            router.push(`/products/edit?id=${productId}`);
        },
        [router]
    );

    const handleStatusChange = useCallback(
        async (product: ProductListItem, isActive: boolean) => {
            const success = await productService.updateProductStatus(product.id, isActive);
            if (success) {
                await productState.refresh();
            }
        },
        [productState]
    );

    const handleDelete = useCallback(
        (product: ProductListItem) => {
            confirmDelete({
                title: 'Hapus Produk',
                entityType: 'produk',
                itemName: product.name,
                onConfirm: async () => {
                    const success = await productService.deleteProduct(product.id);
                    if (success) {
                        await productState.refresh();
                    }
                },
            });
        },
        [productState]
    );

    return (
        <ProductContext.Provider
            value={{
                ...productState,
                expandedProductIds,
                toggleExpandedProduct,
                isExpanded,
                handleEdit,
                handleStatusChange,
                handleDelete,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProductContext() {
    const ctx = useContext(ProductContext);
    if (!ctx) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return ctx;
}
