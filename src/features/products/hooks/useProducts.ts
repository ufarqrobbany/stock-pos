'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Category } from '@/db/types/product';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { PRODUCT_SORT_FIELDS, type ProductListItem, type ProductSortField } from '../types';

export interface ProductsState {
    products: ProductListItem[];
    categories: Category[];
    total: number;
    loading: boolean;
    search: string;
    categoryId: string | null;
    sortBy: ProductSortField;
    sortDirection: 'asc' | 'desc';
    setSearch: (value: string) => void;
    setCategoryId: (value: string | null) => void;
    handleSort: (columnId: string) => void;
    refresh: () => Promise<void>;
}

export function useProducts(): ProductsState {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<ProductSortField>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await productService.loadProducts({ search, categoryId, sortBy, sortDirection });
        setProducts(result.items);
        setTotal(result.total);
        setLoading(false);
    }, [search, categoryId, sortBy, sortDirection]);

    useEffect(() => {
        void categoryService.loadCategories().then(setCategories);
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const handleSort = useCallback(
        (columnId: string) => {
            if (!PRODUCT_SORT_FIELDS.includes(columnId as ProductSortField)) return;

            if (sortBy === columnId) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
                setSortBy(columnId as ProductSortField);
                setSortDirection('asc');
            }
        },
        [sortBy]
    );

    return {
        products,
        categories,
        total,
        loading,
        search,
        categoryId,
        sortBy,
        sortDirection,
        setSearch,
        setCategoryId,
        handleSort,
        refresh,
    };
}
