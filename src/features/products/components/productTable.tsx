'use client';

import { Avatar, Card, Group, Stack, Text } from '@mantine/core';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { useProductContext } from '../context/ProductContext';
import type { ProductListItem } from '../types';
import { createProductColumns } from './productColumns';

function renderExpandedProduct(product: ProductListItem) {
    return (
        <Stack gap="xs" p="sm" bg="surface.0">
            {'image' in product && product.image && (
                <Group gap="xs" mb="xs">
                    <Text size="sm" fw={600}>
                        Foto Produk:
                    </Text>
                    <Avatar src={product.image as string} alt={product.name} radius="sm" size="lg" />
                </Group>
            )}

            <Text size="sm" fw={600}>
                Daftar Varian / SKU
            </Text>
            {product.variants.length ? (
                product.variants.map((variant) => (
                    <Group key={variant.id} justify="space-between">
                        <Text size="sm">
                            {variant.name} · {variant.sku}
                        </Text>
                        <Text size="sm">
                            Rp{variant.price.toLocaleString('id-ID')} · Stok {variant.stock}
                        </Text>
                    </Group>
                ))
            ) : (
                <Text size="sm" c="neutral.4">
                    Produk ini tidak memiliki varian terpisah.
                </Text>
            )}
        </Stack>
    );
}

export function ProductTable() {
    const {
        products,
        loading,
        sortBy,
        sortDirection,
        handleSort,
        handleEdit,
        handleDelete,
        toggleExpandedProduct,
        isExpanded,
        expandedProductIds,
    } = useProductContext();

    const [activePage, setPage] = useState(1);
    const pageSize = 10;

    const paginatedData = useMemo(() => {
        const start = (activePage - 1) * pageSize;
        return products.slice(start, start + pageSize);
    }, [products, activePage]);

    const columns = createProductColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleExpand: toggleExpandedProduct,
        isExpanded,
    });

    return (
        <Card withBorder p="md" shadow="none">
            <DataTable
                columns={columns}
                data={paginatedData}
                loading={loading}
                getRowKey={(item) => item.id}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                minWidth={750}
                emptyText="Produk tidak ditemukan."
                expandedRowIds={expandedProductIds}
                renderExpandedRow={renderExpandedProduct}
                pagination={{
                    page: activePage,
                    pageSize: pageSize,
                    total: products.length,
                    totalPages: Math.ceil(products.length / pageSize),
                    onPageChange: setPage,
                }}
            />
        </Card>
    );
}
