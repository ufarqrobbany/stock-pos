import type { PaginatedResult } from '@/types/common';

export const PRODUCT_SORT_FIELDS = ['name', 'categoryName', 'skuCount', 'price', 'stock'] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

export interface ProductQuery {
    search?: string;
    categoryId?: string | null;
    sortBy?: ProductSortField;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

export interface ProductListVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
}

export interface ProductListItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    categoryId: string;
    categoryName: string;
    skuCount: number;
    price: number | null;
    stock: number;
    isActive: boolean;
    variants: ProductListVariant[];
    image?: string | null;
}

export type ProductListResult = PaginatedResult<ProductListItem>;

export interface CreateProductInput {
    name: string;
    description?: string;
    categoryId: string;
    image?: string;
    hasVariants: boolean;
    sku?: string | null;
    sellingPrice?: number | null;
    lowStockThreshold?: number | null;
    isActive: boolean;
}

export interface CreateProductVariantInput {
    productId: string;
    variantName: string;
    sku: string;
    sellingPrice: number;
    lowStockThreshold: number;
    isActive: boolean;
}
