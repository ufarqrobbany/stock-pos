'use client';

import { useDebouncedValue } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';
import type { Category } from '@/db/types/product';
import { categoryService } from '@/features/products/services/categoryService';
import { productService } from '@/features/products/services/productService';
import type { ProductListItem } from '@/features/products/types';

export interface PosCatalogState {
    search: string;
    debouncedSearch: string;
    selectedCategory: string;
    selectedCategoryName: string;
    categories: Category[];
    products: ProductListItem[];
    totalActiveCount: number;
    hasActiveFilter: boolean;
    loading: boolean;
    setSearch: (value: string) => void;
    setSelectedCategory: (categoryId: string) => void;
    handleResetFilter: () => void;
    loadCatalog: () => Promise<void>;
}

export function usePosCatalog(): PosCatalogState {
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch] = useDebouncedValue(search, 250);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [totalActiveCount, setTotalActiveCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const loadCatalog = useCallback(async () => {
        setLoading(true);
        try {
            const [catList, prodResult, activeCount] = await Promise.all([
                categoryService.loadCategories(),
                productService.loadProducts({
                    search: debouncedSearch.trim() || undefined,
                    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                }),
                productService.countActiveProducts(),
            ]);

            if (catList && catList.length > 0) {
                setCategories([{ id: 'all', name: 'Semua' }, ...catList]);
            } else {
                setCategories([{ id: 'all', name: 'Semua' }]);
            }

            const activeProducts = (prodResult.items || []).filter((p) => p.isActive);
            setProducts(activeProducts);
            setTotalActiveCount(activeCount);
        } catch {
            setCategories([{ id: 'all', name: 'Semua' }]);
            setProducts([]);
            setTotalActiveCount(0);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCategory]);

    useEffect(() => {
        void loadCatalog();
    }, [loadCatalog]);

    const hasActiveFilter = Boolean(
        search.trim() !== '' || debouncedSearch.trim() !== '' || selectedCategory !== 'all'
    );

    const selectedCategoryName =
        selectedCategory === 'all' ? 'Semua' : (categories.find((c) => c.id === selectedCategory)?.name ?? '');

    const handleResetFilter = useCallback(() => {
        setSearch('');
        setSelectedCategory('all');
    }, []);

    return {
        search,
        debouncedSearch,
        selectedCategory,
        selectedCategoryName,
        categories,
        products,
        totalActiveCount,
        hasActiveFilter,
        loading,
        setSearch,
        setSelectedCategory,
        handleResetFilter,
        loadCatalog,
    };
}
