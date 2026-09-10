export interface Category {
    id: string;
    name: string;
    parentId?: string | null;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    categoryId: string;
    image?: string;
    hasVariants: boolean;
    sku?: string | null;
    sellingPrice?: number | null;
    lowStockThreshold?: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    variantName: string;
    sellingPrice: number;
    lowStockThreshold: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}
