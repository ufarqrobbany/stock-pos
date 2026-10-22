'use client';

import { Box, Center, Loader, Text } from '@mantine/core';
import type { UserRole } from '@/db/types/user';
import type { ProductListItem } from '@/features/products/types';
import { PosProductCard } from './PosProductCard';

export interface PosProductGridProps {
    products: ProductListItem[];
    onAddToCart: (product: ProductListItem) => void;
    onSelectVariant: (product: ProductListItem) => void;
    isLoading?: boolean;
    hasActiveFilter?: boolean;
    totalActiveCount?: number;
    searchQuery?: string;
    selectedCategoryName?: string;
    userRole?: UserRole;
}

export function PosProductGrid({
    products,
    onAddToCart,
    onSelectVariant,
    isLoading = false,
    hasActiveFilter = false,
    totalActiveCount,
}: PosProductGridProps) {
    if (isLoading && products.length === 0) {
        return (
            <Center py={80} h="100%">
                <Loader size="md" color="primary" />
            </Center>
        );
    }

    if (products.length === 0) {
        const isFilterEmpty = Boolean(hasActiveFilter && (totalActiveCount === undefined || totalActiveCount > 0));

        return (
            <Center py={80} h="100%">
                <Text size="md" c="neutral.5" ta="center">
                    {isFilterEmpty ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                </Text>
            </Center>
        );
    }

    return (
        <Box
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 185px))',
                gap: 'var(--mantine-spacing-sm)',
            }}
        >
            {products.map((product) => (
                <PosProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onSelectVariant={onSelectVariant}
                />
            ))}
        </Box>
    );
}
